import { db } from "@/server/db";

export const POST = async (req: Request) => {
    const { data } = await req.json();
    const id = data.id;
    const email = data.email_addresses[0].email_address;
    const name = data.first_name + " " + data.last_name;
    const imageUrl = data.image_url;

    // Save user to database
    await db.user.create({
        data: {
            id: id,
            email: email,
            name: name, 
            imageUrl: imageUrl,
            created_at: new Date(data.created_at),
        }
    })
    console.log("user created successfully");
    return new Response('Webhook received', { status: 200 });
}