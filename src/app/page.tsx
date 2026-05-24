import { redirect } from "next/navigation";

// Root "/" resolves via the (customer) route group
export default function RootPage() {
  redirect("/home");
}
