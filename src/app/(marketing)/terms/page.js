import PolicyPage from "@/components/marketing/PolicyPage";

export const metadata = { title: "Terms of Service — Dukaan" };

export default function TermsPage() {
  return (
    <PolicyPage
      title="Terms of Service"
      updated="July 2026"
      intro="These Terms of Service govern your use of Dukaan. By using our software and website, you agree to these terms."
      sections={[
        {
          heading: "Accounts",
          body: [
            "Business accounts are created by Dukaan on behalf of shop owners. You are responsible for keeping your login credentials secure and for all activity under your account and the accounts of users you create.",
          ],
        },
        {
          heading: "Acceptable Use",
          body: [
            "You agree to use Dukaan only for lawful business purposes and in compliance with all applicable local laws, including any regulations relating to the sale of tobacco and related products.",
            "You may not attempt to disrupt the service, access data that does not belong to your business, or resell the software without authorisation.",
          ],
        },
        {
          heading: "Plans and Stores",
          body: [
            "Your plan determines the number of stores you may create. Additional stores can be requested through the app and are subject to approval and any applicable upgrade fees.",
          ],
        },
        {
          heading: "Service Availability",
          body: [
            "We work hard to keep Dukaan available at all times but do not guarantee uninterrupted service. We may perform maintenance or updates that temporarily affect availability.",
          ],
        },
        {
          heading: "Limitation of Liability",
          body: [
            "Dukaan is provided on an 'as is' basis. To the fullest extent permitted by law, we are not liable for any indirect or consequential losses arising from your use of the service.",
          ],
        },
        {
          heading: "Changes to These Terms",
          body: [
            "We may update these terms from time to time. Continued use of Dukaan after changes take effect constitutes acceptance of the revised terms.",
          ],
        },
      ]}
    />
  );
}
