
import { BarChart as BarChartIcon, DollarSign, Loader2, ShoppingBag, TrendingUp, Users, UtensilsCrossed } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../api';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0
  });
  const [revenueData, setRevenueData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        api.get('/orders/'),
        api.get('/products/'),
        api.get('/users/')
      ]);

      const orders = ordersRes.data;
      const products = productsRes.data;
      const users = usersRes.data;

      const revenue = orders.reduce((sum: number, order: any) => sum + parseFloat(order.total_amount), 0);

      setStats({
        totalOrders: orders.length,
        totalRevenue: revenue,
        totalProducts: products.length,
        totalUsers: users.length
      });

      // Process data for Revenue Chart (group by date)
      const revenueByDate: any = {};
      orders.forEach((order: any) => {
        const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        revenueByDate[date] = (revenueByDate[date] || 0) + parseFloat(order.total_amount);
      });

      const chartData = Object.keys(revenueByDate).map(date => ({
        name: date,
        revenue: revenueByDate[date]
      })).slice(-7); // Last 7 entries

      setRevenueData(chartData as any);

      // Process data for Order Status Chart
      const statusCounts: any = {};
      orders.forEach((order: any) => {
        const status = order.status.replace(/_/g, ' ');
        const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1);
        statusCounts[formattedStatus] = (statusCounts[formattedStatus] || 0) + 1;
      });

      const statusChartData = Object.keys(statusCounts).map(status => ({
        name: status,
        orders: statusCounts[status]
      }));

      setOrderStatusData(statusChartData as any);

    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, gradient }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group relative overflow-hidden">
      {/* Background Decoration */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 blur-xl ${gradient}`}></div>

      <div>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
        <p className="text-3xl font-black text-gray-900">{value}</p>
      </div>
      <div className={`p-4 rounded-xl ${gradient} text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2 animate-slideUp">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1 text-lg">Real-time insights and performance metrics.</p>
        </div>
        <div className="bg-white px-5 py-2.5 rounded-xl shadow-sm border border-gray-100 text-sm font-semibold text-gray-500 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slideUp" style={{ animationDelay: '0.1s' }}>
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingBag}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          title="Total Revenue"
          value={`KSh ${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          gradient="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={UtensilsCrossed}
          gradient="bg-gradient-to-br from-orange-500 to-orange-600"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slideUp" style={{ animationDelay: '0.2s' }}>
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              Revenue Trends
            </h2>
            <select className="text-sm bg-gray-50 border-none rounded-lg text-gray-500 font-medium py-1 px-3 focus:ring-0 cursor-pointer hover:bg-gray-100 transition-colors">
              <option>Last 7 Days</option>
            </select>
          </div>
          <div className="h-80 w-full min-h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF4500" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#FF4500" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#1F2937', fontWeight: 600 }}
                  labelStyle={{ color: '#6B7280', marginBottom: '4px' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#FF4500"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  strokeWidth={3}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#FF4500' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
                <BarChartIcon className="w-5 h-5" />
              </div>
              Order Status Distribution
            </h2>
          </div>
          <div className="h-80 w-full min-h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderStatusData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }}
                />
                <Tooltip
                  cursor={{ fill: '#F9FAFB' }}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#1F2937', fontWeight: 600 }}
                  labelStyle={{ color: '#6B7280', marginBottom: '4px' }}
                />
                <Bar
                  dataKey="orders"
                  fill="#4B5563"
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                  animationDuration={1500}
                >
                  {
                    orderStatusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4F46E5' : '#818CF8'} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
