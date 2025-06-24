import { SignIn } from "@clerk/clerk-react";

export default function Auth() {
  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 80 }}>
      <SignIn path="/auth" routing="path" signUpUrl="/auth/sign-up" />
    </div>
  );
}
