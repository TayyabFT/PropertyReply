import PartnerOffer from "@/components/Membership/PartnerOffer";
import BrandLogo from "@/components/BrandLogo";

export default function PartnerInvitePage({ searchParams }: { searchParams: { code?: string } }) {
  return <main className="section"><div className="container">
    <BrandLogo href="/" />
    <PartnerOffer initialCode={typeof searchParams.code === "string" ? searchParams.code : ""} />
  </div></main>;
}
