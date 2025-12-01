import { getAllUsers } from "@/lib/server/users/user_queries";
import { UsersPageClient } from "./users-page-client";

export default async function UsersPage() {
  const users = await getAllUsers();

  return <UsersPageClient initialUsers={users} />;
}
