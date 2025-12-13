
import Skeleton from '@/components/Skeleton';
import api from '@/constants/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MenuScreen() {
    const router = useRouter();
    const { q } = useLocalSearchParams();
    const [categories, setCategories] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (q) {
            setSearchQuery(q as string);
        }
    }, [q]);

    const fetchData = async () => {
        try {
            const [catRes, prodRes] = await Promise.all([
                api.get('/categories/'),
                api.get('/products/')
            ]);
            setCategories(catRes.data);
            setProducts(prodRes.data);
        } catch (error) {
            console.error('Error fetching menu:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, []);

    const filteredItems = products.filter(item =>
        (selectedCategory === 'all' || item.category === selectedCategory) &&
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderCategory = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[
                styles.categoryChip,
                selectedCategory === item.id && styles.activeCategoryChip
            ]}
            onPress={() => setSelectedCategory(item.id)}
        >
            <Text style={[
                styles.categoryChipText,
                selectedCategory === item.id && styles.activeCategoryChipText
            ]}>{item.name}</Text>
        </TouchableOpacity>
    );


    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.gridItem} onPress={() => router.push(`/product/${item.id}` as any)}>
            <Image source={{ uri: item.image }} style={styles.gridImage} />
            {item.is_promoted && item.discount_percentage > 0 && (
                <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{item.discount_percentage}% OFF</Text>
                </View>
            )}
            <View style={styles.gridInfo}>
                <Text style={styles.gridName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.gridDesc} numberOfLines={2}>{item.description}</Text>
                <View style={styles.gridPriceRow}>
                    {item.is_promoted && item.discount_percentage > 0 ? (
                        <View>
                            <Text style={styles.gridOriginalPrice}>KSh {item.price}</Text>
                            <Text style={styles.gridPrice}>KSh {item.discounted_price}</Text>
                        </View>
                    ) : (
                        <Text style={styles.gridPrice}>KSh {item.price}</Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderSkeleton = () => (
        <View style={{ padding: 20 }}>
            <Skeleton width={150} height={30} style={{ marginBottom: 20 }} />
            <Skeleton width="100%" height={50} style={{ borderRadius: 12, marginBottom: 20 }} />
            <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} width={80} height={35} style={{ borderRadius: 20, marginRight: 10 }} />
                ))}
            </View>
            {[1, 2, 3, 4].map(i => (
                <View key={i} style={{ flexDirection: 'row', marginBottom: 15 }}>
                    <Skeleton width={80} height={80} style={{ borderRadius: 12, marginRight: 15 }} />
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Skeleton width="60%" height={20} style={{ marginBottom: 8 }} />
                        <Skeleton width="90%" height={15} style={{ marginBottom: 8 }} />
                        <Skeleton width={50} height={20} />
                    </View>
                </View>
            ))}
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                {renderSkeleton()}
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Our Menu</Text>
            </View>

            <View style={styles.searchContainer}>
                <Search color="#666" size={18} />
                <TextInput
                    placeholder="Search food..."
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#999"
                />
            </View>

            <View style={styles.categoriesContainer}>
                <FlatList
                    data={[{ id: 'all', name: 'All' }, ...categories]}
                    renderItem={renderCategory}
                    keyExtractor={(item) => item.id.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesList}
                />
            </View>

            <FlatList
                data={filteredItems}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.menuList}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF4500']} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No items found</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingHorizontal: 15,
        paddingVertical: 15,
    },
    headerTitle: {
        fontSize: 25,
        fontWeight: 'bold',
        color: '#333',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        marginHorizontal: 15,
        marginBottom: 15,
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: '#333',
    },
    categoriesContainer: {
        marginBottom: 20,
    },
    categoriesList: {
        paddingHorizontal: 20,
    },
    categoryChip: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#FFF',
        borderRadius: 25,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    activeCategoryChip: {
        backgroundColor: '#FF4500',
        borderColor: '#FF4500',
    },
    categoryChipText: {
        fontWeight: '600',
        color: '#666',
    },
    activeCategoryChipText: {
        color: '#FFF',
    },
    menuList: {
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
    row: {
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    gridItem: {
        width: '48%',
        backgroundColor: '#FFF',
        borderRadius: 12,
        marginBottom: 15,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    gridImage: {
        width: '100%',
        height: 140,
    },
    discountBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#FF4500',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    discountText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    gridInfo: {
        padding: 12,
    },
    gridName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    gridDesc: {
        fontSize: 11,
        color: '#888',
        marginBottom: 8,
    },
    gridPriceRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    gridOriginalPrice: {
        fontSize: 11,
        color: '#999',
        textDecorationLine: 'line-through',
        marginBottom: 2,
    },
    gridPrice: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#FF4500',
    },
    menuItem: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 15,
        padding: 12,
        marginBottom: 15,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
    },
    itemInfo: {
        flex: 1,
        marginLeft: 15,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    itemDesc: {
        fontSize: 12,
        color: '#888',
        marginBottom: 8,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF4500',
    },
    addButton: {
        width: 35,
        height: 35,
        backgroundColor: '#FFF0EB',
        borderRadius: 17.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        fontSize: 20,
        color: '#FF4500',
        fontWeight: 'bold',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        color: '#999',
        fontSize: 16,
    },
});
