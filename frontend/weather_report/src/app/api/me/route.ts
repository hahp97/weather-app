import { createApolloClient } from "@/libs/apollo/client";
import { GetMeGql } from "@/libs/apollo/queries";
import { getConfigs } from "@/utils/configs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Extract tokens from cookies
    const token = request.cookies.get("x-token")?.value;
    const refreshToken = request.cookies.get("x-refresh-token")?.value;

    if (!token || !refreshToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Create Apollo client
    const client = createApolloClient({
      ssr: true,
      config: getConfigs(),
    });

    // Fetch user data from backend
    const response = await client.query({
      query: GetMeGql,
      fetchPolicy: "no-cache",
    });

    const me = response.data?.me;

    if (!me) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(me);
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
