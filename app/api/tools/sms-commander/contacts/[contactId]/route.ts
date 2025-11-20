/**
 * SMS Commander - Contact Detail API Route
 *
 * Supports partial updates to an existing contact (e.g., renaming an alias or
 * adding notes). Deletion is not implemented yet because the UI does not
 * expose that action.
 */

import { NextResponse, type NextRequest } from "next/server";

import { updateContact } from "../../../../../tools/sms-commander/lib/contactsStore";
import type {
    ContactCreatePayload,
    ContactMutationResult,
} from "../../../../../tools/sms-commander/lib/types";

interface RouteParams {
    params: Promise<{
        contactId: string;
    }>;
}

export async function PATCH(
    request: NextRequest,
    { params }: RouteParams
): Promise<NextResponse<ContactMutationResult>> {
    const { contactId } = await params;

    let body: Partial<ContactCreatePayload>;

    try {
        body = (await request.json()) as Partial<ContactCreatePayload>;
    } catch {
        return NextResponse.json(
            { success: false, error: "Invalid JSON payload." },
            { status: 400 }
        );
    }

    const result = await updateContact(contactId, body);
    return NextResponse.json(result, {
        status: result.success ? 200 : 404,
    });
}


