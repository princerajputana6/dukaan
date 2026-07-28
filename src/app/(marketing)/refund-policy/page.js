import PolicyPage from "@/components/marketing/PolicyPage";

export const metadata = { title: "Refund Policy — Dukaan" };

export default function RefundPolicyPage() {
  return (
    <PolicyPage
      title="Refund & Cancellation Policy"
      updated="July 2026"
      intro="This policy explains how subscription payments, cancellations and refunds work for Dukaan."
      sections={[
        {
          heading: "Subscriptions",
          body: [
            "Dukaan is offered on a monthly or annual subscription basis depending on your plan. Your subscription renews automatically until cancelled.",
          ],
        },
        {
          heading: "Cancellation",
          body: [
            "You may cancel your subscription at any time by contacting our support team. Your account remains active until the end of the current billing period.",
          ],
        },
        {
          heading: "Refunds",
          body: [
            "If you are not satisfied, you may request a refund within 7 days of your initial purchase for a full refund of that payment.",
            "Renewal payments are generally non-refundable, but we review reasonable requests on a case-by-case basis.",
          ],
        },
        {
          heading: "Plan Upgrades",
          body: [
            "When you upgrade your plan to add more stores, the change takes effect immediately. Any applicable charges are calculated for the remainder of your billing cycle.",
          ],
        },
        {
          heading: "How to Request a Refund",
          body: [
            "Email support@dukaan.app with your business name and the payment in question. Approved refunds are processed to your original payment method within 5–10 business days.",
          ],
        },
      ]}
    />
  );
}
