import { NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

type UploadType = 'avatar' | 'product'

const s3Client = new S3Client({
  endpoint: process.env.DIGITALOCEAN_SPACES_ENDPOINT,
  region: process.env.DIGITALOCEAN_SPACES_REGION,
  credentials: {
    accessKeyId: process.env.DIGITALOCEAN_SPACES_KEY!,
    secretAccessKey: process.env.DIGITALOCEAN_SPACES_SECRET!,
  },
})

function generateKey(type: UploadType, userId: string, productId?: string): string {
  if (type === 'avatar') {
    return `users/${userId}/avatar/${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  } else {
    if (!productId) {
      throw new Error('Product ID is required for product uploads')
    }
    return `products/${userId}/${productId}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as UploadType
    const userId = formData.get('userId') as string
    const productId = formData.get('productId') as string

    if (!file || !type || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (type === 'product' && !productId) {
      return NextResponse.json(
        { error: 'Product ID is required for product uploads' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const key = generateKey(type, userId, productId)
    const bucket = process.env.DIGITALOCEAN_SPACES_BUCKET!

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      ACL: 'public-read',
    })

    await s3Client.send(command)

    const endpoint = process.env.DIGITALOCEAN_SPACES_ENDPOINT!.replace(/^https?:\/\//, "");
    const url = `https://${bucket}.${endpoint}/${key}`;

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
} 