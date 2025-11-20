/**
 * SMS Commander - Contacts Collection API Route
 *
 * Provides listing and creation of contact aliases so the chat UI can show
 * human-friendly names for each counterpart phone number.
 */

import { NextResponse } from "next/server";

import {
    createContact,
    listContacts,
} from "../../../../tools/sms-commander/lib/contactsStore";
import type {
    ContactListResponse,
    ContactMutationResult,
    ContactCreatePayload,
} from "../../../../tools/sms-commander/lib/types";

export async function GET(): Promise<NextResponse<ContactListResponse>> {
    const contacts = await listContacts();
    return NextResponse.json({ contacts });
}

export async function POST(
    request: Request
): Promise<NextResponse<ContactMutationResult>> {
    let body: ContactCreatePayload;

    try {
        body = (await request.json()) as ContactCreatePayload;
    } catch {
        return NextResponse.json(
            { success: false, error: "Invalid JSON payload." },
            { status: 400 }
        );
    }

    const result = await createContact(body);
    return NextResponse.json(result, {
        status: result.success ? 200 : 400,
    });
}


