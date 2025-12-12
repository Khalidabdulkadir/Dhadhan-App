import { DollarSign, ShoppingBag, TrendingUp, Users, UtensilsCrossed } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../api';

export default function Dashboard() {
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
      })).slice(-7); // Last 7 entries (days)

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
    }
  };

  const StatCard = ({ title, value, icon: Icon, bgColor, textColor }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center transition-transform transform hover:-translate-y-1 hover:shadow-md">
      <div className={`p-4 rounded-xl ${bgColor} bg-opacity-10 mr-4`}>
        <Icon className={`w-6 h-6 ${textColor}`} />
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingBag}
          bgColor="bg-blue-600"
          textColor="text-blue-600"
        />
        <StatCard
          title="Total Revenue"
          value={`KSh ${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          bgColor="bg-green-600"
          textColor="text-green-600"
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={UtensilsCrossed}
          bgColor="bg-orange-600"
          textColor="text-orange-600"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          bgColor="bg-purple-600"
          textColor="text-purple-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary" />
              Revenue Trends
            </h2>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF4500" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#FF4500" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#FF4500" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800">Order Status Distribution</h2>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderStatusData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                <Tooltip
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend />
                <Bar dataKey="orders" fill="#4B5563" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
