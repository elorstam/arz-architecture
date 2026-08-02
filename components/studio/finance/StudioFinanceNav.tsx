import StudioTabs,{type StudioTabItem}from"@/components/studio/StudioTabs";
const items:readonly StudioTabItem[]=[
 {href:"/studio/finance",label:"Genel Bakış",icon:"dashboard"},
 {href:"/studio/finance/incomes",label:"Gelirler",icon:"wallet"},
 {href:"/studio/finance/expenses",label:"Giderler",icon:"receipt"},
 {href:"/studio/finance/payments",label:"Tahsilatlar",icon:"check"},
 {href:"/studio/finance/progress-payments",label:"Hakedişler",icon:"file-text"},
 {href:"/studio/finance/profitability",label:"Proje Karlılığı",icon:"chart"},
 {href:"/studio/finance/cash-flow",label:"Nakit Akışı",icon:"activity"},
 {href:"/studio/finance/invoices",label:"Faturalar",icon:"receipt"},
 {href:"/studio/finance/reports",label:"Raporlar",icon:"chart"},
];
export default function StudioFinanceNav({active}:{active:string}){return <StudioTabs items={items} active={active} ariaLabel="Finans bölümleri" variant="icon-navigation"/>}
