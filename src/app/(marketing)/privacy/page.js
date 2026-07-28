import PolicyPage from "@/components/marketing/PolicyPage";

export const metadata = { title: "Privacy Policy — Dukaan" };

export default function PrivacyPage() {
  return (
    <PolicyPage
      title="Privacy Policy"
      updated="July 2026"
      intro="This Privacy Policy explains how Dukaan collects, uses and protects the information you provide when you use our shop-management software and website."
      sections={[
        {
          heading: "Information We Collect",
          body: [
            "Account information such as your name, business name, email address and phone number, provided when you request or use an account.",
            "Operational data you enter into the app, including products, inventory levels, sales records and staff accounts you create.",
          ],
        },
        {
          heading: "How We Use Your Information",
          body: [
            "We use your information to provide and operate the Dukaan service, set up your account, process your sales and inventory data, and support you.",
            "We do not sell your personal information or your business data to third parties.",
          ],
        },
        {
          heading: "Data Security",
          body: [
            "Passwords are stored using industry-standard one-way hashing and are never stored in plain text. Access to your business data is restricted to your account and the users you authorise.",
          ],
        },
        {
          heading: "Data Retention",
          body: [
            "We retain your business data for as long as your account is active. You may request deletion of your account and associated data by contacting support.",
          ],
        },
        {
          heading: "Your Rights",
          body: [
            "You can access, correct or export your business data at any time from within the app, or request assistance from our support team.",
          ],
        },
        {
          heading: "Contact",
          body: [
            "For any privacy questions, email us at support@dukaan.app.",
          ],
        },
      ]}
    />
  );
}
