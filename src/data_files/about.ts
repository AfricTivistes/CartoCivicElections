import type { ImageMetadata } from "astro";
import type { Lang } from "@/i18n/ui";
import eu from "../../public/partenaires/eu-logo.png";
import afeonet from "../../public/partenaires/afeonet.png";
import esn from "../../public/partenaires/esn-sa.png";
import epd from "../../public/partenaires/EPD.png";
import ehorn from "../../public/partenaires/e-horn.png";
import waeon from "../../public/partenaires/WAEON.png";
import dri from "../../public/partenaires/dri.png";

type AboutContent = {
  title: string;
  lede: string;
  blocks: { kicker: string; title: string; html: string }[];
  stakesTitle: string;
  stakes: string[];
  partnersTitle: string;
  partnersText: string;
  aheadBtn: string;
};

export const about: Record<Lang, AboutContent> = {
  en: {
    title: "About Sóobu",
    lede: "Sóobu AfricTivistes, Tech4Elections maps, catalogues and connects citizen electoral initiatives across Africa. ‘Sóobu’ is Wolof for ‘commitment, mobilisation’.",
    blocks: [
      {
        kicker: "Context",
        title: "Elections under pressure",
        html: "Elections in Africa are often marked by irregularities and tensions, resulting in crises that can lead to political instability. These malfunctions particularly affect young people and women, often at the cost of their freedom or their lives. Faced with these challenges, civil society has been mobilising for decades, developing innovative initiatives to strengthen the integrity of electoral processes.\n\nFrom Dakar to Nairobi, from Tunis to Johannesburg, hundreds of initiatives have been developed, some backed by digital technologies. However, these efforts remain largely undocumented and unrecognised, reducing their potential to inspire change on a larger scale and foster the rise of a stronger participatory democracy.",
      },
      {
        kicker: "The initiative",
        title: "Sóobu AfricTivistes",
        html: `As part of its Democracy, Elections and Governance component, <a href="https://africtivistes.com/en/home/" target="_blank" rel="noopener">AfricTivistes</a> is rolling out the <a href="https://africtivistes.com/en/africtivistes-maps-citizen-electoral-initiatives-in-africa/" target="_blank" rel="noopener">Sóobu AfricTivistes, Tech4Elections</a> initiative, dedicated to mapping, cataloguing, enhancing and connecting these citizen contributions across the continent. The initiative aims to inspire collective action and strengthen democratic governance in Africa.\n\nThe initiative is also part of the pan-African project <a href="https://ahead.africa" target="_blank" rel="noopener">AHEAD Africa</a>, which aims to improve electoral integrity and equip civil society to strengthen democratic processes.`,
      },
      {
        kicker: "Objective",
        title: "Centralise, highlight, connect",
        html: "The platform aims to centralise detailed data on citizen election initiatives throughout the electoral cycle, highlighting their key role in promoting transparent, reliable and peaceful processes. By highlighting these citizen initiatives, it creates a space for collaboration and sharing, and encourages the dissemination of good practice.",
      },
      {
        kicker: "Data",
        title: "How the data is gathered",
        html: "The platform gathers, centralises and organises qualitative and quantitative data on citizens' electoral initiatives in Africa since 2010: types of initiatives, areas of intervention, objectives, targets and geographical scope. The data is collected through questionnaires, desk reviews and interviews.",
      },
    ],
    stakesTitle: "What is at stake",
    stakes: [
      "Ensuring the reliability of data on electoral initiatives in Africa",
      "Highlighting good practice",
      "Promoting citizen participation",
    ],
    partnersTitle: "Partners",
    partnersText:
      "The project is co-funded by the European Union and implemented by a consortium of election observation and democracy support networks.",
    aheadBtn: "More about AHEAD Africa",
  },
  fr: {
    title: "À propos de Sóobu",
    lede: "Sóobu AfricTivistes, Tech4Elections cartographie, répertorie et connecte les initiatives citoyennes électorales en Afrique. « Sóobu » signifie « engagement, mobilisation » en wolof.",
    blocks: [
      {
        kicker: "Contexte",
        title: "Des élections sous tension",
        html: "Les élections en Afrique sont souvent marquées par des irrégularités et des tensions, engendrant des crises pouvant provoquer des instabilités politiques. Ces dysfonctionnements affectent particulièrement les jeunes et les femmes, souvent au prix de leur liberté ou de leur vie. Face à ces défis, la société civile s’est mobilisée depuis des décennies, développant des initiatives innovantes pour renforcer l’intégrité des processus électoraux.\n\nDe Dakar à Nairobi, de Tunis à Johannesburg, des centaines d’initiatives ont vu le jour, certaines soutenues par des technologies numériques. Cependant, ces efforts restent largement sous-documentés et méconnus, réduisant leur potentiel à inspirer un changement à plus grande échelle et à favoriser l’émergence d’une démocratie participative renforcée.",
      },
      {
        kicker: "L’initiative",
        title: "Sóobu AfricTivistes",
        html: `Dans le cadre de sa composante Démocratie, Élections et Gouvernance, <a href="https://africtivistes.org/" target="_blank" rel="noopener">AfricTivistes</a> déploie l'initiative <a href="https://africtivistes.com/en/africtivistes-cartographie-les-initiatives-citoyennes-electorales-en-afrique" target="_blank" rel="noopener">Sóobu AfricTivistes, Tech4Elections</a>, dédiée à cartographier, répertorier, valoriser et connecter ces contributions citoyennes à travers le continent. Cette initiative ambitionne d’inspirer l’action collective et de renforcer la gouvernance démocratique en Afrique.\n\nL’initiative s’inscrit également dans le projet panafricain <a href="https://ahead.africa/fr/" target="_blank" rel="noopener">AHEAD Africa</a>, qui vise à améliorer l’intégrité électorale et à outiller la société civile pour renforcer les processus démocratiques.`,
      },
      {
        kicker: "Objectifs",
        title: "Centraliser, valoriser, connecter",
        html: "La plateforme ambitionne de centraliser des données détaillées sur des initiatives citoyennes électorales tout au long du cycle électoral, mettant en lumière leur rôle clé dans la promotion de processus transparents, fiables et apaisés. En valorisant ces actions citoyennes, elle crée un espace de collaboration et de partage, et encourage la diffusion des bonnes pratiques.",
      },
      {
        kicker: "Données",
        title: "Comment les données sont collectées",
        html: "La plateforme collecte, centralise et organise des données qualitatives et quantitatives sur les initiatives citoyennes électorales en Afrique depuis 2010 : typologie des initiatives, domaines d'intervention, objectifs, cibles et portée géographique. Les données sont recueillies via des questionnaires, des recherches documentaires et des entretiens.",
      },
    ],
    stakesTitle: "Les enjeux",
    stakes: [
      "Assurer la fiabilité des données sur les initiatives électorales en Afrique",
      "Mettre en lumière les bonnes pratiques",
      "Promouvoir la participation citoyenne",
    ],
    partnersTitle: "Partenaires",
    partnersText:
      "Le projet est co-financé par l’Union européenne et mis en oeuvre par un consortium constitué de réseaux d’observation électorale et de soutien à la démocratie.",
    aheadBtn: "Plus sur AHEAD Africa",
  },
};

export const partners: { logo: ImageMetadata; name: string; href: string }[] = [
  { logo: eu, name: "European Union", href: "https://europa.eu/" },
  { logo: afeonet, name: "AfEONET", href: "https://acfim.org/afeonet/" },
  { logo: esn, name: "ESN-SA", href: "https://www.esn-sa.org/" },
  { logo: epd, name: "EPD", href: "https://epd.eu/" },
  { logo: ehorn, name: "E-HORN", href: "https://ehorn.org/" },
  { logo: waeon, name: "WAEON", href: "https://www.waeon.org/" },
  { logo: dri, name: "ZESN", href: "https://democracy-reporting.org/en/office/global" },
];
