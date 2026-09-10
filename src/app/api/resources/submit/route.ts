import { NextRequest, NextResponse } from 'next/server';
import { createResourceSubmission, ResourceSubmissionError } from '@/lib/resources/submissions';
import { getRequestIp, getRequestUserAgent } from '@/lib/resources/ip';
import { submitResourceSchema } from '@/lib/resources/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = submitResourceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Unable to submit this resource. Please try again.' },
        { status: 400 },
      );
    }

    if (parsed.data.honeypot) {
      return NextResponse.json({ error: 'Unable to submit this resource. Please try again.' }, { status: 400 });
    }

    const [submitterIp, userAgent] = await Promise.all([getRequestIp(), getRequestUserAgent()]);

    const result = await createResourceSubmission({
      contributorNumber: parsed.data.contributorNumber,
      name: parsed.data.name,
      title: parsed.data.title,
      url: parsed.data.url,
      submitterIp,
      userAgent,
    });

    return NextResponse.json({
      message:
        'Thank you for contributing to Jain knowledge. Your resource has been submitted for review.',
      contributorNumber: result.contributorNumber,
      contributorName: result.contributorName,
      contributorLabel: result.contributorLabel,
    });
  } catch (error) {
    if (error instanceof ResourceSubmissionError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: 'Unable to submit this resource. Please try again.' },
      { status: 500 },
    );
  }
}
