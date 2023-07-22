import CardResult from "@/components/CardResult";
import Header from "@/components/Header";
import Image from "next/image";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import ScrollToTopButton from "@/components/ScrollToTopButton";

const DynamicCardResult = dynamic(() => import("../components/CardResult"));
const DynamicTableResult = dynamic(() => import("../components/TableResult"));
const DynamicFooter = dynamic(() => import("../components/footer"));
const DynamicResultlistone = dynamic(() =>  import("../components/resultlistone"));
export default function Home() {
  return (
    <>
      <head>
        <title>Rj mumbai - Live Satta Result and Chart for Rj mumbai</title>
        <meta
          name="description"
          content="Rj mubai - Live Satta Result and Chart. Get the latest results and charts of Super Dubai, Super Faridabad, Delhi Bazar, Shri Ganesh, and more."
        />
        <meta
          name="keywords"
          content="Rj mubai Satta, Rj mubai satta,rdlmatkasatta,Rj mubai,Satta Matka Game, Satta Matka Result, Matka Game, Satta Chart, Super Dubai, Super Faridabad, Delhi Bazar, Shri Ganesh, Faridabad, Gazyabad, Gali, Desawar"
        />
        <link href="https://www.rjmumbai.com" rel="canonical" />
        <meta
          property="og:title"
          content="Rj mubai - Live Satta Result and Chart"
        />
        <meta
          property="og:description"
          content="Rj mubai - Live Satta Result and Chart. Get the latest results and charts of Super Dubai, Super Faridabad, Delhi Bazar, Shri Ganesh, and more."
        />
        <meta property="og:url" content="https://www.rjmumbai.com" />
        <meta property="og:type" content="website" />
        {/* <meta
          property="og:image"
          content="https://www.rjmumbai.com/_next/static/media/logo.642444d4.svg"
        /> */}
        <meta
          property="og:image:alt"
          content="Rj mubai - Live Satta Result and Chart"
        />
      </head>
      <Navbar />
      <Header />
      <DynamicCardResult />
      <DynamicTableResult />
      <DynamicResultlistone />
      <ScrollToTopButton />

      <DynamicFooter />
    </>
  );
}
