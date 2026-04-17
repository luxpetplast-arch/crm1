import { prisma } from '../server/utils/prisma';

const customers = [
  { name: "Fahri aka", phone: "+998000000001", address: "Toshkent" },
  { name: "Muxasham oil", phone: "+998000000002", address: "Toshkent" },
  { name: "Ohun eg", phone: "+998000000003", address: "G'ijduvon" },
  { name: "Shohi eg-G'ijduvon", phone: "+998000000004", address: "G'ijduvon" },
  { name: "Shohi eg-Buxoro", phone: "+998000000005", address: "Buxoro" },
  { name: "Shohi eg-Toshkent 1111", phone: "+998000000006", address: "Toshkent" },
  { name: "Shamsi eg-Toshkent yashil", phone: "+998000000007", address: "Toshkent" },
  { name: "Farhod-Shamsi", phone: "+998000000008", address: "Toshkent" },
  { name: "Utkir aka yog", phone: "+998000000009", address: "Toshkent" },
  { name: "Tuyka aka Mors", phone: "+998000000010", address: "Toshkent" },
  { name: "Eco Water", phone: "+998000000011", address: "Baliqchi" },
  { name: "Baliqchi masala zavod", phone: "+998000000012", address: "Baliqchi" },
  { name: "Ohangaron masala zavod", phone: "+998000000013", address: "Ohangaron" },
  { name: "Koson masala zavod", phone: "+998000000014", address: "Koson" },
  { name: "Jonibek Nukus-Muzdek sum", phone: "+998000000015", address: "Nukus" },
  { name: "Shuxrat aka Toshkent", phone: "+998000000016", address: "Toshkent" },
  { name: "Obidxon aka NAMANGAN", phone: "+998000000017", address: "Namangan" },
  { name: "Farrux aka Romitan", phone: "+998000000018", address: "Romitan" },
  { name: "Iftixor Andijon", phone: "+998000000019", address: "Andijon" },
  { name: "Baxrom aka Shahrisabz", phone: "+998000000020", address: "Shahrisabz" },
  { name: "Mumin aka Mors", phone: "+998000000021", address: "Toshkent" },
  { name: "Aquarius", phone: "+998000000022", address: "Toshkent" },
  { name: "Sherzod aka Kukon", phone: "+998000000023", address: "Qo'qon" },
  { name: "BEKAJON", phone: "+998000000024", address: "Toshkent" },
  { name: "EVER-MAC CALDO", phone: "+998000000025", address: "Toshkent" },
  { name: "Daily", phone: "+998000000026", address: "Toshkent" },
  { name: "Atlantis", phone: "+998000000027", address: "Toshkent" },
  { name: "Farhod Ellik qal'a", phone: "+998000000028", address: "Ellik qal'a" },
  { name: "Navoiy-Solis", phone: "+998000000029", address: "Navoiy" },
  { name: "Navoiy-Paxtachi", phone: "+998000000030", address: "Navoiy" },
  { name: "ZAM-ZAM", phone: "+998000000031", address: "Toshkent" },
  { name: "Abdusamad", phone: "+998000000032", address: "Toshkent" },
  { name: "Elyor gel", phone: "+998000000033", address: "Toshkent" },
  { name: "Emir water", phone: "+998000000034", address: "Toshkent" },
  { name: "Ravshan aka Buxoro", phone: "+998000000035", address: "Buxoro" },
  { name: "Hamdam", phone: "+998000000036", address: "Toshkent" },
  { name: "Peshku masala zavod", phone: "+998000000037", address: "Peshku" },
  { name: "G'ijduvon masala zavod", phone: "+998000000038", address: "G'ijduvon" },
  { name: "Chimboy masala zavod", phone: "+998000000039", address: "Chimboy" },
  { name: "Sardoba masala zavod", phone: "+998000000040", address: "Sardoba" },
  { name: "Sulton masala zavod", phone: "+998000000041", address: "Toshkent" },
  { name: "Namangan tola tekstil", phone: "+998000000042", address: "Namangan" },
  { name: "Amirobod", phone: "+998000000043", address: "Toshkent" },
  { name: "Magic", phone: "+998000000044", address: "Toshkent" },
  { name: "Ravshan aka Qarshi", phone: "+998000000045", address: "Qarshi" },
  { name: "Mansur aka Qarshi", phone: "+998000000046", address: "Qarshi" },
  { name: "Qarshi Brend paket", phone: "+998000000047", address: "Qarshi" },
  { name: "Oqtosh mineral", phone: "+998000000048", address: "Oqtosh" },
  { name: "Dafane", phone: "+998000000049", address: "Toshkent" },
  { name: "LONG WATER", phone: "+998000000050", address: "Toshkent" },
  { name: "Hisrav Samarqand", phone: "+998000000051", address: "Samarqand" },
  { name: "Alyaska water", phone: "+998000000052", address: "Toshkent" },
  { name: "Javoxir-Veva jurasi", phone: "+998000000053", address: "Toshkent" },
  { name: "Yagona water", phone: "+998000000054", address: "Toshkent" },
  { name: "Nur vater", phone: "+998000000055", address: "Toshkent" },
  { name: "Safis suv", phone: "+998000000056", address: "Toshkent" },
  { name: "Shukur aka Qarshi", phone: "+998000000057", address: "Qarshi" },
  { name: "Doctor water", phone: "+998000000058", address: "Toshkent" },
  { name: "Zarafshon Bobur", phone: "+998000000059", address: "Zarafshon" },
  { name: "Uygun Sherobod", phone: "+998000000060", address: "Sherobod" },
  { name: "Miralii aka", phone: "+998000000061", address: "Toshkent" },
  { name: "Poytaxt suv", phone: "+998000000062", address: "Toshkent" },
  { name: "Akbarxon Shavkat siryo", phone: "+998000000063", address: "Toshkent" },
  { name: "Kachoklar", phone: "+998000000064", address: "Toshkent" },
  { name: "Tosh akani dommoti", phone: "+998000000065", address: "Toshkent" },
  { name: "Muhammad-Bulvar", phone: "+998000000066", address: "Toshkent" },
  { name: "Endeles", phone: "+998000000067", address: "Toshkent" },
  { name: "Sobir aka Termiz", phone: "+998000000068", address: "Termiz" },
  { name: "Dream water", phone: "+998000000069", address: "Toshkent" },
  { name: "Ozod aka Termiz", phone: "+998000000070", address: "Termiz" },
  { name: "Vodiylik tog'acha", phone: "+998000000071", address: "Sirdaryo" },
  { name: "Sirdaryo 5-10l", phone: "+998000000072", address: "Sirdaryo" },
  { name: "Osiyo", phone: "+998000000073", address: "Toshkent" },
  { name: "Sirdaryo 90.107-00-47", phone: "+998000000074", address: "Sirdaryo" },
  { name: "Qattqurgon 5-10", phone: "+998000000075", address: "Qattqurgon" },
  { name: "Qattqurgon 18.9-10l", phone: "+998000000076", address: "Qattqurgon" }
];

async function addCustomers() {
  console.log('Adding customers to database...');
  
  try {
    for (const customer of customers) {
      // Check if customer already exists
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          OR: [
            { name: customer.name },
            { phone: customer.phone }
          ]
        }
      });

      if (existingCustomer) {
        console.log(`Customer "${customer.name}" already exists, skipping...`);
        continue;
      }

      // Create new customer
      const newCustomer = await prisma.customer.create({
        data: {
          name: customer.name,
          phone: customer.phone,
          address: customer.address,
          category: "NORMAL",
          balance: 0,
          balanceUZS: 0,
          balanceUSD: 0,
          debt: 0,
          debtUZS: 0,
          debtUSD: 0,
          creditLimit: 0,
          paymentTermDays: 30,
          discountPercent: 0,
          notificationsEnabled: true,
          debtReminderDays: 7
        }
      });

      console.log(`Created customer: ${newCustomer.name} (${newCustomer.phone})`);
    }

    console.log('All customers added successfully!');
    
  } catch (error) {
    console.error('Error adding customers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addCustomers();
