// import { waitUntil } from "@vercel/functions";
// import { auth } from "@clerk/nextjs/server";
// import { NextRequest, NextResponse } from "next/server";
// import { exchangeCodeForAccessToken, getAccountDetails } from "@/lib/aurinko";
// import { db } from "@/server/db";
// import axios from "axios";

// export const GET = async (req: NextRequest) => {
//   const { userId } = await auth();
//   if (!userId)
//     return NextResponse.json(new Error("Unauthorized"), { status: 401 });

//   const params = req.nextUrl.searchParams;
//   const status = params.get("status");
//   if (status !== "success")
//     return NextResponse.json(
//       { message: "Failed to link account" },
//       { status: 400 },
//     );

//   const code = params.get("code");
//   if (!code)
//     return NextResponse.json({ message: "Code not found" }, { status: 400 });
//   const token = await exchangeCodeForAccessToken(code as string);
//   if (!token)
//     return NextResponse.json(
//       { message: "Failed to exchange code for access token" },
//       { status: 400 },
//     );

//   const accountDetails = await getAccountDetails(token.accessToken);

//   // Check if the user exists
//   // let user = await db.user.findUnique({
//   //     where: { id: userId }
//   // });

//   // if (!user) {
//   //     return NextResponse.redirect(new URL('/mail', req.url))
//   // }

//   try {
//     console.log("Upserting account", token.accountId.toString());
//     await db.account.upsert({
//       where: {
//         id: token.accountId.toString(),
//       },
//       create: {
//         id: token.accountId.toString(),
//         userId,
//         accessToken: token.accessToken,
//         email: accountDetails.email,
//         name: accountDetails.name,
//       },
//       update: {
//         accessToken: token.accessToken,
//       },
//     });
//   } catch (error) {
//     console.error("Failed to upsert account", error);
//     return NextResponse.json(
//       { message: "Failed to upsert account" },
//       { status: 400 },
//     );
//   }

//   // trigger initial sync endpoint
//   await waitUntil(
//     axios
//       .post(`${process.env.NEXT_PUBLIC_URL}/api/initial-sync`, {
//         accountId: token.accountId.toString(),
//         userId: userId,
//       })
//       .then((response) => {
//         console.log("Initial sync triggered", response.data);
//       })
//       .catch((error) => {
//         console.error("Failed to trigger initial sync", error);
//       }),
//   );

//   return NextResponse.redirect(new URL("/mail", req.url));
// };


import { waitUntil } from "@vercel/functions";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForAccessToken, getAccountDetails } from "@/lib/aurinko";
import { db } from "@/server/db";
import axios from "axios";

export const GET = async (req: NextRequest) => {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json(new Error("Unauthorized"), { status: 401 });

  const params = req.nextUrl.searchParams;
  const status = params.get("status");
  if (status !== "success")
    return NextResponse.json(
      { message: "Failed to link account" },
      { status: 400 },
    );

  const code = params.get("code");
  if (!code)
    return NextResponse.json({ message: "Code not found" }, { status: 400 });
  const token = await exchangeCodeForAccessToken(code as string);
  if (!token)
    return NextResponse.json(
      { message: "Failed to exchange code for access token" },
      { status: 400 },
    );

  const accountDetails = await getAccountDetails(token.accessToken);

  // Check if the user exists
  const user = await db.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    return NextResponse.json({ message: "User not found", userId: userId}, { status: 404 });
  }

  try {
    console.log("Upserting account", token.accountId.toString());
    await db.account.upsert({
      where: {
        id: token.accountId.toString(),
      },
      create: {
        id: token.accountId.toString(),
        userId,
        accessToken: token.accessToken,
        email: accountDetails.email,
        name: accountDetails.name,
      },
      update: {
        accessToken: token.accessToken,
      },
    });
  } catch (error) {
    console.error("Failed to upsert account", error);
    return NextResponse.json(
      { message: "Failed to upsert account" },
      { status: 400 },
    );
  }

  // trigger initial sync endpoint
  await waitUntil(
    axios
      .post(`${process.env.NEXT_PUBLIC_URL}/api/initial-sync`, {
        accountId: token.accountId.toString(),
        userId: userId,
      })
      .then((response) => {
        console.log("Initial sync triggered", response.data);
      })
      .catch((error) => {
        console.error("Failed to trigger initial sync", error);
      }),
  );

  return NextResponse.redirect(new URL("/mail", req.url));
};