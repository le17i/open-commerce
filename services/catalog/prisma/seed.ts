import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  Brand,
  Category,
  Color,
  Kind,
} from "../src/database/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

type ProductInsert = {
  title: string;
  description?: string;
  brand: Brand;
  category: Category;
  color: Color;
  kind: Kind;
  model: string;
  barcode?: string;
  price: number;
  height: number;
  length: number;
  slug?: string;
  stock: number;
  weight: number;
  width: number;
};

export const convertToSlug = (text: string) => {
  const a = "àáäâãèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;";
  const b = "aaaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------";
  const p = new RegExp(a.split("").join("|"), "g");
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(p, (c) => b.charAt(a.indexOf(c))) // Replace special chars
    .replace(/&/g, "-e-") // Replace & with 'and'
    .replace(/[\s\W-]+/g, "-"); // Replace spaces, non-word characters and dashes with a single dash (-)
};

async function addBrand(title: string, code: string, description = "") {
  const slug = convertToSlug(title);
  return await prisma.brand.create({
    data: {
      title,
      code,
      description,
      slug,
    },
  });
}

async function addColor(
  title: string,
  colorHex: string,
  code: string,
  description = "",
) {
  const slug = convertToSlug(title);
  return await prisma.color.create({
    data: {
      title,
      colorHex,
      code,
      description,
      slug,
    },
  });
}

async function addCategory(title: string, code: string, description = "") {
  const slug = convertToSlug(title);
  return await prisma.category.create({
    data: {
      title,
      code,
      description,
      slug,
    },
  });
}

async function addKind(code: string, label: string) {
  return await prisma.kind.create({
    data: { code, label },
  });
}

async function addProduct(
  title: string,
  brand: Brand,
  category: Category,
  color: Color,
  kind: Kind,
  model: string,
  barcode: string,
  price = 199,
  stock = 100,
  height = 1,
  length = 1,
  weight = 1,
  width = 1,
  description = "",
  slug = "",
) {
  slug = slug ? slug : convertToSlug(title);
  const modelSlug = convertToSlug(model);
  const sku = `${category.code}${kind.code}${brand.code}${modelSlug}${color.code}`;

  await prisma.product.create({
    data: {
      brandId: brand.id,
      categoryId: category.id,
      colorId: color.id,
      kindId: kind.id,
      barcode,
      model,
      title,
      description,
      height,
      length,
      weight,
      width,
      slug,
      sku,
      stock,
      offers: {
        create: { price, isActive: true },
      },
      status: "PUBLISHED",
    },
  });
}

async function truncateDatabase() {
  await prisma.offer.deleteMany();
  await prisma.image.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.color.deleteMany();
  await prisma.kind.deleteMany();
  await prisma.tag.deleteMany();
}

async function createProducts() {
  const [papelariaCategory, techCategory] = await Promise.all([
    addCategory(
      "Papelaria",
      "PAP",
      "Encontre canetas de cachorro, lápis de flamingos e muitas coisas de capivaras",
    ),
    addCategory("Tech", "TCH", "Acessórios para smartphones, tablets, pcs"),
  ]);

  const [
    bicBrand,
    decoSkinBrand,
    faberBrand,
    jansportBrand,
    tilibraBrand,
    vansBrand,
  ] = await Promise.all([
    addBrand("BIC", "BIC"),
    addBrand("Deco Skin", "DSK"),
    addBrand("Faber Castel", "FBC"),
    addBrand("JanSport", "JAS"),
    addBrand("Tilibra", "TLB"),
    addBrand("Vans", "VNS"),
  ]);

  const [
    whiteColor,
    blackColor,
    blueColor,
    brownColor,
    orangeColor,
    redColor,
    yellowColor,
  ] = await Promise.all([
    addColor("white", "#ffffff", "WHITE"),
    addColor("black", "#000000", "BLACK"),
    addColor("blue", "#4000ff", "BLUE"),
    addColor("brown", "#964B00", "BROWN"),
    addColor("orange", "#FFA500", "ORANGE"),
    addColor("red", "#CD0000", "RED"),
    addColor("yellow", "#FFFF00", "YELLOW"),
  ]);

  const [
    penKind,
    pencilKind,
    coloredPencilKind,
    notebookKind,
    binderBlockKind,
    schoolbagKind,
    plasticRubberKind,
    cableKind,
    phoneChargerKind,
    headsetAdapterKind,
  ] = await Promise.all([
    addKind("PEN", "Caneta"),
    addKind("PENCIL", "Lápis"),
    addKind("COLORED_PENCIL", "Lápis de Cor"),
    addKind("NOTEBOOK", "Caderno"),
    addKind("BINDER_BLOCK", "Bloco de Fichário"),
    addKind("SCHOOL_BAG", "Mochila"),
    addKind("PLASTIC_RUBBER", "Borracha plástica"),
    addKind("CABLE", "Cabo"),
    addKind("PHONE_CHARGER", "Carregador de Celular"),
    addKind("HEADSET_ADAPTER", "Adaptador de Fone de Celular"),
  ]);

  const papelariaProducts: ProductInsert[] = [
    {
      title: "Borracha de gatinho",
      description: "Borracha do gatinho laranja e branco",
      brand: faberBrand,
      category: papelariaCategory,
      color: orangeColor,
      kind: plasticRubberKind,
      model: "Faber Castel BG 1",
      price: 249,
      height: 5,
      length: 2,
      slug: "borracha-de-gatinho-laranja",
      stock: 100,
      weight: 0.05,
      width: 3,
    },
    {
      title: "Lapís de flamingo",
      description: "Lapís com um flamingo de biscuit na ponta",
      brand: faberBrand,
      category: papelariaCategory,
      color: blackColor,
      kind: pencilKind,
      model: "Faber Castel LF 1",
      price: 149,
      height: 21,
      length: 1,
      stock: 100,
      weight: 0.01,
      width: 1,
    },
    {
      title: "Caneta de cachorro",
      description: "Caneta com um cachorro de biscuit na ponta",
      brand: bicBrand,
      category: papelariaCategory,
      color: blueColor,
      kind: penKind,
      model: "BIC C 1",
      price: 199,
      height: 21,
      length: 1,
      stock: 100,
      weight: 0.01,
      width: 1,
    },
    {
      title: "Lápis de Cor",
      description: "Caixa de lápis de cor com 12 cores",
      brand: faberBrand,
      category: papelariaCategory,
      color: redColor,
      kind: coloredPencilKind,
      model: "Faber Castel Aquarela 12 cores",
      price: 1199,
      height: 21,
      length: 1,
      slug: "caixa-lapis-de-cor-12-cores",
      stock: 50,
      weight: 0.09,
      width: 12,
    },
    {
      title: "Lápis de Cor",
      description: "Caixa de lápis de cor com 24 cores",
      brand: faberBrand,
      category: papelariaCategory,
      color: redColor,
      kind: coloredPencilKind,
      model: "Faber Castel Aquarela 24 cores",
      price: 2499,
      height: 21,
      length: 1,
      slug: "caixa-lapis-de-cor-24-cores",
      stock: 50,
      weight: 0.15,
      width: 24,
    },
    {
      title: "Lápis de Cor",
      description: "Caixa de lápis de cor com 36 cores",
      brand: faberBrand,
      category: papelariaCategory,
      color: redColor,
      kind: coloredPencilKind,
      model: "Faber Castel Aquarela 36 cores",
      price: 4299,
      height: 21,
      length: 2,
      slug: "caixa-lapis-de-cor-36-cores",
      stock: 50,
      weight: 0.21,
      width: 12,
    },
    {
      title: "Refil de Fichario das Capivaras 96 folhas",
      description: "Refil de Fichario com desenhos de capivaras de 96 Folhas",
      brand: tilibraBrand,
      category: papelariaCategory,
      color: whiteColor,
      kind: binderBlockKind,
      model: "Tilibra Capivaria 96 F",
      price: 1499,
      height: 28,
      length: 1,
      stock: 100,
      weight: 0.03,
      width: 20,
    },
    {
      title: "Refil de Fichario das Capivaras 200 folhas",
      description: "Refil de Fichario com desenhos de capivaras de 200 Folhas",
      brand: tilibraBrand,
      category: papelariaCategory,
      color: whiteColor,
      kind: binderBlockKind,
      model: "Tilibra Capivaria 200 F",
      price: 2199,
      height: 28,
      length: 2,
      stock: 100,
      weight: 0.06,
      width: 20,
    },
    {
      title: "Mochila JanSport Preta",
      description:
        "Com seu característico design, a JanSport SuperBreak é super leve para ser usada no dia-a-dia. Esta mochila está disponível em dezenas de cores e estampas diferentes, combinando com diversos estilos.",
      brand: jansportBrand,
      category: papelariaCategory,
      color: blackColor,
      kind: schoolbagKind,
      model: "JanSport Bag P",
      price: 29999,
      height: 42,
      length: 21,
      stock: 20,
      weight: 0.3,
      width: 33,
    },
    {
      title: "Mochila JanSport Super Smart Preta e Vermelha",
      description:
        'Com sua característica base em couro camurça, a Right Pack é a mochila mais icônica e clássica da JanSport. Com um bolso interno que comporta um laptop de até 15" e bolso frontal organizador, a Right Pack da JanSport é, com certeza, a melhor mochila durante o seu dia e em qualquer lugar que for. É a clássica original, mas se combinada com os seus looks, é tudo que você precisa para completar um estilo sofisticado!',
      brand: jansportBrand,
      category: papelariaCategory,
      color: redColor,
      kind: schoolbagKind,
      model: "JanSport Bag R",
      price: 64999,
      height: 46,
      length: 14,
      stock: 100,
      weight: 0.6,
      width: 33,
    },
    {
      title: "Mochila Vans Realm Lavender Fog",
      description:
        "Mochila confeccionada em poliéster com compartimento interno grande, bolso para notebook, bolso externo com organizador e fechamento em zíper, alça ajustável e logo estampado.",
      brand: vansBrand,
      category: papelariaCategory,
      color: whiteColor,
      kind: schoolbagKind,
      model: "Vans Realm P",
      price: 27999,
      height: 43,
      length: 13,
      stock: 100,
      weight: 0.25,
      width: 33,
    },
  ];

  const techProducts = [
    {
      title: "Cabo microUSB 1m",
      description: "",
      brand: decoSkinBrand,
      category: techCategory,
      color: whiteColor,
      kind: cableKind,
      model: "DECO CABLE USB-MICRO 1M",
      price: 1899,
      height: 13,
      length: 2,
      stock: 100,
      weight: 0.02,
      width: 6,
    },
    {
      title: "Cabo microUSB 2m",
      description: "",
      brand: decoSkinBrand,
      category: techCategory,
      color: whiteColor,
      kind: cableKind,
      model: "DECO CABLE USB-MICRO 2M",
      price: 1499,
      height: 13,
      length: 4,
      stock: 100,
      weight: 0.04,
      width: 6,
    },
    {
      title: "Cabo USB-C 1m",
      description: "",
      brand: decoSkinBrand,
      category: techCategory,
      color: whiteColor,
      kind: cableKind,
      model: "DECO CABLE USB-C 1M",
      price: 2999,
      height: 13,
      length: 2,
      stock: 100,
      weight: 0.02,
      width: 6,
    },
    {
      title: "Cabo USB-C 2m",
      description: "",
      brand: decoSkinBrand,
      category: techCategory,
      color: whiteColor,
      kind: cableKind,
      model: "DECO CABLE USB-C 2M",
      price: 4999,
      height: 13,
      length: 4,
      stock: 100,
      weight: 0.04,
      width: 6,
    },
    {
      title: "Adaptador USB-C para fone de ouvido",
      description: "",
      brand: decoSkinBrand,
      category: techCategory,
      color: whiteColor,
      kind: headsetAdapterKind,
      model: "DECO ADAPTER USB-C P2",
      price: 4999,
      height: 16,
      length: 1,
      stock: 100,
      weight: 0.02,
      width: 6,
    },
    {
      title: "Adaptador USB-C para fone de ouvido e carregamento",
      description:
        "Adaptador USB-C com saídas para fone de ouvido (p2) e para USB-C",
      brand: decoSkinBrand,
      category: techCategory,
      color: whiteColor,
      kind: headsetAdapterKind,
      model: "DECO ADAPTER USB-C HYBRID",
      price: 7999,
      height: 13,
      length: 2,
      stock: 100,
      weight: 0.04,
      width: 6,
    },
  ];

  [...papelariaProducts, ...techProducts].forEach(
    (product: ProductInsert, index: number) =>
      addProduct(
        product.title,
        product.brand,
        product.category,
        product.color,
        product.kind,
        product.model,
        `${100000000 + index}`,
        product.price,
        product.stock,
        product.height,
        product.length,
        product.weight,
        product.width,
        product.description,
        product?.slug ?? "",
      ),
  );
}

async function main() {
  await truncateDatabase();
  await createProducts();
}

main()
  .catch((err) => console.error(err))
  .finally(() => prisma.$disconnect);
