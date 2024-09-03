import { NextResponse } from "next/server";
import { dbAdmin } from "@/app/_firebase/firebaseAdmin";

export async function POST(request) {
  const event = await request.json();

  try {
    if (event.type === "user.deleted") {
      const userId = event.data.id;

      const collections = [
        "subscriptions",
        "likes",
        "movieHistory",
        "posts",
        "users",
        "watchlist",
        "chatHistory",
        "comments",
      ];

      await Promise.all(
        collections.map(async (collection) => {
          const snapshot = await dbAdmin
            .collection(collection)
            .where("userId", "==", userId)
            .get();
          const batch = dbAdmin.batch();

          snapshot.forEach((doc) => {
            batch.delete(doc.ref);
          });

          await batch.commit();
        })
      );

      return NextResponse.json({
        message: "User data deleted successfully.",
      });
    } else {
      return NextResponse.json(
        { error: "Invalid event type" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error deleting user data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
