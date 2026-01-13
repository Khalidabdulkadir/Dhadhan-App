import Skeleton from '@/components/Skeleton';
import api, { BASE_URL } from '@/constants/api';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { BadgeCheck, Clock, Search } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RestaurantDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [restaurant, setRestaurant] = useState<any>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | string | null>('all');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchRestaurantData();
    }, [id]);

    const fetchRestaurantData = async () => {
        try {
            setLoading(true);
            const [restRes, catRes, prodRes] = await Promise.all([
                api.get(`/restaurants/${id}/`),
                api.get(`/categories/?restaurant=${id}`),
                api.get(`/products/?restaurant=${id}`)
            ]);

            setRestaurant(restRes.data);
            const fetchedCategories = catRes.data;
            // Prepend "All" category
            setCategories([{ id: 'all', name: 'All' }, ...fetchedCategories]);
            setProducts(prodRes.data);

            // Default select "All" is already set in initial state, or set here:
            setSelectedCategory('all');
        } catch (error) {
            console.error("Error fetching restaurant details:", error);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (url: string) => {
        if (!url) return 'https://via.placeholder.com/150';
        if (url.startsWith('http')) return url;
        return `${BASE_URL}${url}`;
    };

    const filteredProducts = products.filter(p => {
        const matchesCategory = selectedCategory === 'all'
            ? true
            : selectedCategory
                ? (p.category === selectedCategory || p.category?.id === selectedCategory)
                : true;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const renderCategoryTab = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[
                styles.categoryTab,
                selectedCategory === item.id && styles.activeCategoryTab
            ]}
            onPress={() => setSelectedCategory(item.id)}
        >
            <Text style={[
                styles.categoryTabText,
                selectedCategory === item.id && styles.activeCategoryTabText
            ]}>
                {item.name}
            </Text>
            {selectedCategory === item.id && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
    );

    const renderProduct = (item: any) => (
        <TouchableOpacity
            key={item.id}
            style={styles.productRow}
            onPress={() => router.push(`/product/${item.id}`)}
        >
            <Image source={{ uri: getImageUrl(item.image) }} style={styles.productImage} />
            <View style={styles.productInfo}>
                <View style={styles.productHeader}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productPrice}>${item.price}</Text>
                </View>
                <Text style={styles.productDesc} numberOfLines={2}>{item.description}</Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.container}>
                {/* Header Skeleton */}
                <Skeleton width={width} height={180} />
                <View style={{ flex: 1, backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -20, paddingTop: 24, paddingHorizontal: 16 }}>
                    {/* Info Card Skeleton */}
                    <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                        <Skeleton width={64} height={64} style={{ borderRadius: 12, marginRight: 16 }} />
                        <View>
                            <Skeleton width={150} height={20} style={{ marginBottom: 8, borderRadius: 4 }} />
                            <Skeleton width={100} height={14} style={{ borderRadius: 4 }} />
                        </View>
                    </View>

                    {/* Search Bar Skeleton */}
                    <Skeleton width={'100%'} height={50} style={{ borderRadius: 25, marginBottom: 20 }} />

                    {/* Tabs Skeleton */}
                    <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                        {[1, 2, 3, 4].map(i => (
                            <Skeleton key={i} width={60} height={30} style={{ borderRadius: 15, marginRight: 16 }} />
                        ))}
                    </View>

                    {/* Products Skeleton */}
                    {[1, 2, 3].map(i => (
                        <View key={i} style={{ flexDirection: 'row', marginBottom: 20 }}>
                            <Skeleton width={80} height={80} style={{ borderRadius: 12, marginRight: 16 }} />
                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                <Skeleton width={'60%'} height={16} style={{ marginBottom: 8, borderRadius: 4 }} />
                                <Skeleton width={'30%'} height={14} style={{ borderRadius: 4 }} />
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        );
    }

    if (!restaurant) {
        return (
            <View style={[styles.container, styles.center]}>
                <Text>Restaurant not found</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={{ flex: 1, position: 'relative' }}>
                {/* Header / Cover Image */}
                <View style={styles.headerContainer}>
                    <Image
                        source={{ uri: getImageUrl(restaurant.cover_image || restaurant.logo) }}
                        style={styles.coverImage}
                    />
                    {/* Back Button Removed */}
                </View>

                {/* Force Status Bar Visible */}
                <StatusBar hidden={false} style="light" />

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Floating Info Card */}
                    <View style={styles.restaurantCard}>
                        <View style={styles.cardHeader}>
                            <Image source={{ uri: getImageUrl(restaurant.logo) }} style={styles.logo} />
                            <View style={styles.cardInfo}>
                                <View style={styles.nameRow}>
                                    <Text style={styles.restaurantName}>{restaurant.name}</Text>
                                    {restaurant.is_verified && (
                                        <BadgeCheck size={18} color="#1877F2" fill="#1877F2" stroke="white" />
                                    )}
                                </View>
                                <Text style={styles.tagline}>{restaurant.description || 'Tasty food for you'}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.deliveryInfo}>
                            <View style={styles.deliveryItem}>
                                <Clock size={16} color="#555" />
                                <Text style={styles.deliveryText}>25 - 40 mins</Text>
                            </View>
                        </View>
                    </View>

                    {/* Search Bar */}
                    <View style={styles.searchSection}>
                        <View style={styles.searchBar}>
                            <Search size={20} color="#666" />
                            <TextInput
                                placeholder={`Search in ${restaurant.name}...`}
                                style={styles.searchInput}
                                placeholderTextColor="#999"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                    </View>

                    {/* Categories Tabs */}
                    <View style={styles.categoriesContainer}>
                        <FlatList
                            data={categories}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderCategoryTab}
                            contentContainerStyle={styles.categoriesList}
                        />
                        <View style={styles.tabDivider} />
                    </View>

                    {/* Products List */}
                    <View style={styles.productsList}>
                        {filteredProducts.map(item => renderProduct(item))}
                        {filteredProducts.length === 0 && (
                            <Text style={styles.emptyText}>No items found.</Text>
                        )}
                    </View>

                    {/* Bottom Padding */}
                    <View style={{ height: 40 }} />
                </ScrollView>
            </View>
        </View>
    );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 180, // Reduced from 220
        zIndex: 0,
    },
    coverImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    headerActions: {
        position: 'absolute',
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 10,
    },
    circleButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 130, // Reduced from 160
    },
    restaurantCard: {
        marginHorizontal: 16,
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 16,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        marginBottom: 24,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        width: 64,
        height: 64,
        borderRadius: 12,
        backgroundColor: '#EEE',
    },
    cardInfo: {
        flex: 1,
        marginLeft: 16,
        justifyContent: 'center',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    restaurantName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111',
    },
    tagline: {
        fontSize: 13,
        color: '#666',
        marginBottom: 6,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 16,
    },
    deliveryInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    deliveryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#F8F9FA',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    deliveryText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
    },
    searchSection: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 25,
        paddingHorizontal: 16,
        height: 50,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        color: '#333',
    },
    categoriesContainer: {
        marginBottom: 10,
    },
    categoriesList: {
        paddingHorizontal: 16,
        gap: 24, // Space between tabs
    },
    categoryTab: {
        paddingVertical: 12,
        position: 'relative',
    },
    activeCategoryTab: {
        // Styles if needed
    },
    categoryTabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    activeCategoryTabText: {
        color: '#000',
        fontWeight: 'bold',
    },
    activeTabIndicator: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: '#000',
        borderRadius: 2,
    },
    tabDivider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginTop: -1, // Overlap bottom of tabs
    },
    productsList: {
        paddingHorizontal: 16,
        marginTop: 10,
    },
    productRow: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        marginBottom: 16,
        borderRadius: 16,
        padding: 12,
        // No shadow to match clean list look in design? Or subtle shadow. Design looks like clean white cards list.
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#EEE',
    },
    productInfo: {
        flex: 1,
        marginLeft: 14,
        justifyContent: 'center',
    },
    productHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111',
        flex: 1,
        marginRight: 8,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111',
    },
    productDesc: {
        fontSize: 13,
        color: '#888',
        lineHeight: 18,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 30,
        color: '#999',
    }
});
