import { Button } from "@/components/ui/button";
import { LinkAccountButton } from "@/components/link-account-button";

export default async function Home() {
  return (
    <main className="w-screen h-screen flex justify-center items-center">
      <div className="w-64 bg-zinc-50 p-4 border rounded-lg space-y-2">
        <h1 className="text-left w-full font-light">
          Link your Google Account
        </h1>
        <LinkAccountButton />
      </div>
    </main>
  );
}
