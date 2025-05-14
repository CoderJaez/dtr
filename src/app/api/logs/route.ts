import { NextResponse } from 'next/server';
import axios from 'axios';
import * as https from 'https';


const logs: { id: number; message: string }[] = [];

export async function POST(request: Request) {
    const body = await request.json();

    try {

        const agent = new https.Agent({ rejectUnauthorized: false });
        const response = await axios.post(
            'https://27.110.162.133/idilg/datalog.php',
            new URLSearchParams(body as Record<string, string>).toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                httpsAgent: agent
            }
        );
        console.log(response.data);
        if (response.status !== 200) {
            return NextResponse.json({ error: 'Failed to fetch data from external endpoint' }, { status: 500 });
        }

        return NextResponse.json("ok", { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch data from external endpoint' }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json(logs, { status: 200 });
}

export async function PUT(request: Request) {
    const body = await request.json();
    const logIndex = logs.findIndex((log) => log.id === body.id);

    if (logIndex === -1) {
        return NextResponse.json({ error: 'Log not found' }, { status: 404 });
    }

    logs[logIndex].message = body.message;
    return NextResponse.json(logs[logIndex], { status: 200 });
}

export async function DELETE(request: Request) {
    const body = await request.json();
    const logIndex = logs.findIndex((log) => log.id === body.id);

    if (logIndex === -1) {
        return NextResponse.json({ error: 'Log not found' }, { status: 404 });
    }

    const deletedLog = logs.splice(logIndex, 1);
    return NextResponse.json(deletedLog[0], { status: 200 });
}