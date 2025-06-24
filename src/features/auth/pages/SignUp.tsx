import { SignUp } from "@clerk/clerk-react";

export default function SignUpPage() {
  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 80 }}>
      <SignUp path="/auth/sign-up" routing="path" signInUrl="/auth" />
    </div>
  );
} 