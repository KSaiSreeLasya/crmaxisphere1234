import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import {
  Bell,
  Users,
  TrendingUp,
  Eye,
  Calendar,
  Mail,
  Phone,
  FileText,
  Plus,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface SalesPerson {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
}

interface Lead {
  id: string;
  name: string;
  company: string;
  job_title: string;
  status_id: string;
  assigned_to?: string;
}

interface LeadStatus {
  id: string;
  name: string;
  order_index: number;
  color: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  created_at: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [salesPersons, setSalesPersons] = useState<SalesPerson[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [statuses, setStatuses] = useState<LeadStatus[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    fetchData();
  }, [user?.id]);

  const fetchData = async () => {
    try {
      const { data: sp } = await supabase.from("sales_persons").select("*");
      if (sp) setSalesPersons(sp);

      const { data: leadsData } = await supabase.from("leads").select("*");
      if (leadsData) setLeads(leadsData);

      const { data: statusData } = await supabase
        .from("lead_status_pipeline")
        .select("*");
      if (statusData) setStatuses(statusData);

      const { data: invoicesData } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      if (invoicesData) setInvoices(invoicesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (statusId: string) => {
    const status = statuses.find((s) => s.id === statusId);
    if (!status) return "bg-gray-100 text-gray-800";

    const colorMap: Record<string, string> = {
      gray: "bg-gray-100 text-gray-800",
      blue: "bg-blue-100 text-blue-800",
      purple: "bg-purple-100 text-purple-800",
      yellow: "bg-yellow-100 text-yellow-800",
      orange: "bg-orange-100 text-orange-800",
      pink: "bg-pink-100 text-pink-800",
      green: "bg-green-100 text-green-800",
    };
    return colorMap[status.color] || "bg-gray-100 text-gray-800";
  };

  const assignedLeads = leads.filter((l) => l.assigned_to === user?.id).length;
  const upcomingReminders = 0;

  if (loading) {
    return (
      <Layout showSidebar={true}>
        <div className="p-6 flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSidebar={true}>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="bg-white rounded-t-lg border border-b-0 border-gray-200 mb-0">
              <TabsList className="w-full justify-start rounded-none bg-transparent p-0">
                <TabsTrigger
                  value="overview"
                  className="rounded-none border-b-2 border-transparent px-6 py-4 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="sales-persons"
                  className="rounded-none border-b-2 border-transparent px-6 py-4 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Salespersons
                </TabsTrigger>
                <TabsTrigger
                  value="invoices"
                  className="rounded-none border-b-2 border-transparent px-6 py-4 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Invoices
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-0">
              <div className="space-y-8">
                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white shadow-lg">
                  <h1 className="text-3xl font-bold mb-2">
                    Welcome to Axisphere CRM
                  </h1>
                  <p className="text-blue-100 mb-6">
                    Manage your sales team and team efficiently
                  </p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => navigate("/leads")}
                      className="bg-white text-blue-600 font-semibold px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Manage Leads
                    </button>
                    <button
                      onClick={() => navigate("/admin/sales-persons/add")}
                      className="bg-white text-blue-600 font-semibold px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Manage Sales Persons
                    </button>
                    <button
                      onClick={() => navigate("/admin/invoices")}
                      className="bg-white text-blue-600 font-semibold px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Manage Invoices
                    </button>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* My Assigned Leads */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-gray-600 font-medium text-sm">
                        My Assigned Leads
                      </h3>
                      <Eye className="w-5 h-5 text-blue-400" />
                    </div>
                    <p className="text-4xl font-bold text-gray-900">
                      {assignedLeads}
                    </p>
                  </div>

                  {/* Upcoming Reminders */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-gray-600 font-medium text-sm">
                        Upcoming Reminders
                      </h3>
                      <Bell className="w-5 h-5 text-yellow-400" />
                    </div>
                    <p className="text-4xl font-bold text-gray-900">
                      {upcomingReminders}
                    </p>
                  </div>

                  {/* Total Sales Persons */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-gray-600 font-medium text-sm">
                        Total Sales Persons
                      </h3>
                      <Users className="w-5 h-5 text-green-400" />
                    </div>
                    <p className="text-4xl font-bold text-gray-900">
                      {salesPersons.length}
                    </p>
                  </div>
                </div>

                {/* Upcoming Reminders Section */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Upcoming Reminders
                    </h2>
                    <span className="text-sm text-gray-500">0 total</span>
                  </div>
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <Bell className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-gray-600 font-medium">No upcoming reminders</p>
                    <p className="text-gray-400 text-sm">
                      All your tasks are up to date
                    </p>
                  </div>
                </div>

                {/* Next 7 Days Summary */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Next 7 Days Summary
                  </h2>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-900">0</p>
                      <p className="text-gray-500 text-sm mt-2">Overdue</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-900">0</p>
                      <p className="text-gray-500 text-sm mt-2">Due today</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-900">0</p>
                      <p className="text-gray-500 text-sm mt-2">Later</p>
                    </div>
                  </div>
                </div>

                {/* Recent Leads and Sales Persons */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Recent Leads */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Recent Leads
                      </h2>
                      <button
                        onClick={() => navigate("/leads")}
                        className="text-blue-600 text-sm font-medium hover:text-blue-700"
                      >
                        View All
                      </button>
                    </div>
                    {leads.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <p className="text-gray-500">No leads yet</p>
                        <button
                          onClick={() => navigate("/leads/add")}
                          className="mt-4 text-blue-600 text-sm font-medium hover:text-blue-700"
                        >
                          Add Your First Lead
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {leads.slice(0, 3).map((lead) => {
                          const status = statuses.find(
                            (s) => s.id === lead.status_id,
                          );
                          return (
                            <div
                              key={lead.id}
                              className="flex items-start justify-between py-3 border-b border-gray-100 last:border-b-0"
                            >
                              <div>
                                <p className="font-medium text-gray-900">
                                  {lead.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {lead.company}
                                </p>
                              </div>
                              <span
                                className={`text-xs font-semibold px-3 py-1 rounded ${getStatusColor(
                                  lead.status_id,
                                )}`}
                              >
                                {status?.name || "Unknown"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Recent Sales Persons */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Recent Sales Persons
                      </h2>
                      <button
                        onClick={() => navigate("/admin/sales-persons/add")}
                        className="text-blue-600 text-sm font-medium hover:text-blue-700"
                      >
                        View All
                      </button>
                    </div>
                    {salesPersons.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <p className="text-gray-500">No sales persons yet</p>
                        <button
                          onClick={() => navigate("/admin/sales-persons/add")}
                          className="mt-4 text-blue-600 text-sm font-medium hover:text-blue-700"
                        >
                          Add Your First Sales Person
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {salesPersons.slice(0, 3).map((person) => {
                          const personLeads = leads.filter(
                            (l) => l.assigned_to === person.id,
                          ).length;
                          return (
                            <div
                              key={person.id}
                              className="flex items-start justify-between py-3 border-b border-gray-100 last:border-b-0"
                            >
                              <div>
                                <p className="font-medium text-gray-900">
                                  {person.name}
                                </p>
                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                  <Mail className="w-3 h-3" />
                                  {person.email}
                                </p>
                              </div>
                              <span className="text-sm font-medium text-gray-600">
                                {personLeads} leads
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Quick Stats
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-900">
                        {leads.length}
                      </p>
                      <p className="text-gray-500 text-sm mt-2">Total Leads</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-900">
                        {salesPersons.length}
                      </p>
                      <p className="text-gray-500 text-sm mt-2">
                        Total Sales Persons
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-900">
                        {
                          leads.filter((l) =>
                            statuses.find(
                              (s) => s.id === l.status_id && s.name === "Email",
                            ),
                          ).length
                        }
                      </p>
                      <p className="text-gray-500 text-sm mt-2">Leads with Email</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-900">
                        {
                          leads.filter((l) =>
                            statuses.find(
                              (s) => s.id === l.status_id && s.name === "Phone",
                            ),
                          ).length
                        }
                      </p>
                      <p className="text-gray-500 text-sm mt-2">Leads with Phone</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Salespersons Tab */}
            <TabsContent value="sales-persons" className="mt-0">
              <div className="bg-white rounded-b-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Sales Persons Management
                  </h2>
                  <Button
                    onClick={() => navigate("/admin/sales-persons/add")}
                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Sales Person
                  </Button>
                </div>

                {salesPersons.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No sales persons yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Add your first sales person to get started
                    </p>
                    <Button
                      onClick={() => navigate("/admin/sales-persons/add")}
                      className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Sales Person
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {salesPersons.map((person) => {
                      const personLeads = leads.filter(
                        (l) => l.assigned_to === person.id,
                      ).length;
                      return (
                        <div
                          key={person.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <h4 className="font-semibold text-gray-900">
                            {person.name}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {person.email}
                          </p>
                          {person.phone && (
                            <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {person.phone}
                            </p>
                          )}
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">{personLeads}</span> leads
                              assigned
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              Status:{" "}
                              <span
                                className={`font-medium ${
                                  person.status === "active"
                                    ? "text-green-600"
                                    : "text-gray-600"
                                }`}
                              >
                                {person.status}
                              </span>
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Invoices Tab */}
            <TabsContent value="invoices" className="mt-0">
              <div className="bg-white rounded-b-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recent Invoices
                  </h2>
                  <Button
                    onClick={() => navigate("/admin/invoices")}
                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create Invoice
                  </Button>
                </div>

                {invoices.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No invoices yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Create your first invoice to get started
                    </p>
                    <Button
                      onClick={() => navigate("/admin/invoices")}
                      className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Create Invoice
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {invoice.invoice_number}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {invoice.customer_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {invoice.customer_email}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-600">
                            ₹
                            {invoice.total_amount.toLocaleString("en-IN", {
                              maximumFractionDigits: 2,
                            })}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(invoice.created_at).toLocaleDateString(
                              "en-IN",
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 border-t border-gray-200">
                      <Button
                        onClick={() => navigate("/admin/invoices")}
                        variant="outline"
                        className="w-full"
                      >
                        View All Invoices
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
