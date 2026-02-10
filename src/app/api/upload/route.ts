
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentBase64 = buffer.toString('base64');

    // Create unique filename using timestamp and sanitize the original name
    const originalName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const filename = `${Date.now()}-${originalName}`;
    
    // GitHub API Configuration
    const REPO_OWNER = 'bigwin959';
    const REPO_NAME = 'lugyiminn_landing';
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const BRANCH = 'main'; // Target branch

    if (!GITHUB_TOKEN) {
      console.error('GITHUB_TOKEN is missing');
      return NextResponse.json({ success: false, error: 'Server configuration error: GITHUB_TOKEN missing' }, { status: 500 });
    }

    const path = `public/uploads/${filename}`;
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Upload image: ${filename}`,
        content: contentBase64,
        branch: BRANCH,
      }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('GitHub API Error:', errorData);
        throw new Error(`GitHub API Error: ${response.statusText}`);
    }

    // Return the raw URL or a relative path that will work after rebuild/deployment
    // Note: The image won't be immediately available on the deployed site until a rebuild completes if using relative path
    // For immediate preview, we can use the raw.githubusercontent.com URL
    const rawUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${path}`;
    
    // Returning the relative path as used in the frontend, but be aware of the rebuild delay
    // Alternatively, return the rawUrl for immediate display if the frontend supports it
    // Let's return the relative path to maintain consistency with existing data structure, 
    // but the user should be aware of the delay.
    // Actually, to make it work immediately in the admin panel preview, let's return the raw URL.
    
    return NextResponse.json({ success: true, url: rawUrl });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
