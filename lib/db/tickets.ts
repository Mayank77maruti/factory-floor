/**
 * Frontline Mode Tickets Repository.
 *
 * Persists and retrieves equipment inspection work orders, safety stop tickets,
 * and uploaded inspection photo references in Cloud Storage and Firestore.
 */

import { config } from "../config";
import { getFirestoreClient } from "../gcp/firestore";
import { getStorageClient } from "../gcp/storage";
import { logError, logInfo } from "../logger";
import { Ticket } from "../mock/frontlineData";

const COLLECTION_NAME = "frontline_tickets";

export interface FrontlineTicketRecord extends Ticket {
  assignedTo: string;
  query?: string;
  diagnosis?: string;
  checklist?: string[];
  storageUri?: string;
  createdAt: number;
  updatedAt: number;
}

// In-memory fallback cache for dev / mock mode
const localFrontlineTickets = new Map<string, FrontlineTicketRecord>();

/**
 * Persists a new or updated frontline ticket to Firestore and Cloud Storage.
 */
export async function saveFrontlineTicket(params: {
  ticket: Ticket;
  assignedTo?: string;
  query?: string;
  diagnosis?: string;
  checklist?: string[];
  image?: {
    name: string;
    data: string; // base64
    mimeType?: string;
  };
}): Promise<FrontlineTicketRecord> {
  const { ticket, assignedTo = "marcus", query, diagnosis, checklist, image } = params;
  const now = Date.now();

  let storageUri: string | undefined;

  // 1. Upload inspection photo to Google Cloud Storage if provided
  if (image && image.data) {
    try {
      const storage = getStorageClient();
      if (storage) {
        const cleanBase64 = image.data.replace(/^data:[^;]+;base64,/, "");
        const buffer = Buffer.from(cleanBase64, "base64");
        const safeName = (image.name || "part.jpg").replace(/[^a-zA-Z0-9._-]/g, "_");
        const objectPath = `frontline/tickets/${ticket.code}/${safeName}`;

        const bucket = storage.bucket(config.storageBucket);
        const file = bucket.file(objectPath);

        await file.save(buffer, {
          contentType: image.mimeType || "image/jpeg",
          metadata: {
            ticketCode: ticket.code,
            assignedTo,
            category: "frontline_inspection_photo",
          },
          resumable: false,
        });

        storageUri = `gs://${config.storageBucket}/${objectPath}`;
        logInfo("Inspection photo uploaded to Cloud Storage", {
          service: "storage",
          ticketCode: ticket.code,
          storageUri,
        });
      } else {
        storageUri = `mock://storage/frontline/tickets/${ticket.code}/${image.name || "part.jpg"}`;
      }
    } catch (storageErr) {
      logError("Failed to upload inspection photo to Cloud Storage", storageErr, {
        service: "storage",
        ticketCode: ticket.code,
      });
      storageUri = `mock://storage/frontline/tickets/${ticket.code}/${image.name || "part.jpg"}`;
    }
  }

  const record: FrontlineTicketRecord = {
    ...ticket,
    assignedTo,
    query,
    diagnosis,
    checklist,
    storageUri,
    createdAt: now,
    updatedAt: now,
  };

  // 2. Persist record to Firestore
  try {
    const db = getFirestoreClient();
    if (db) {
      await db.collection(COLLECTION_NAME).doc(ticket.code).set(record, { merge: true });
      logInfo("Frontline ticket persisted to Firestore", {
        service: "firestore",
        ticketCode: ticket.code,
      });
    }
  } catch (firestoreErr) {
    logError("Failed to persist frontline ticket to Firestore", firestoreErr, {
      service: "firestore",
      ticketCode: ticket.code,
    });
  }

  // Always update in-memory cache
  localFrontlineTickets.set(ticket.code, record);

  return record;
}

/**
 * Retrieves all frontline tickets.
 */
export async function listFrontlineTickets(): Promise<FrontlineTicketRecord[]> {
  try {
    const db = getFirestoreClient();
    if (db) {
      const snap = await db.collection(COLLECTION_NAME).orderBy("createdAt", "desc").get();
      if (!snap.empty) {
        return snap.docs.map((doc) => doc.data() as FrontlineTicketRecord);
      }
    }
  } catch (err) {
    logError("Failed to list frontline tickets from Firestore", err, {
      service: "firestore",
    });
  }

  return Array.from(localFrontlineTickets.values()).sort((a, b) => b.createdAt - a.createdAt);
}

