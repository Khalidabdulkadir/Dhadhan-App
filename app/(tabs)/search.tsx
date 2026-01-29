
import api from '@/constants/api';
import { getImageUrl } from '@/utils/image';
import { useRouter } from 'expo-router';
import { Search as SearchIcon, TrendingUp, X } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SearchScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [promotions, setPromotions] = useState<any[]>([]);
    const flatListRef = useRef<FlatList>(null);
    const scrollIndex = useRef(0);

    React.useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        try {
            const response = await api.get('/products/');
            const promotedProducts = response.data.filter((p: any) => p.is_promoted);
            setPromotions(promotedProducts);
        } catch (error) {
            // Error fetching
        }
    };
    // Auto-scroll effect
    useEffect(() => {
        if (promotions.length === 0) return;

        const interval = setInterval(() => {
            if (flatListRef.current) {
                scrollIndex.current = (scrollIndex.current + 1) % promotions.length;
                flatListRef.current.scrollToIndex({
                    index: scrollIndex.current,
                    animated: true,
                    viewPosition: 0.5
                });
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [promotions]);


    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const response = await api.get('/products/');
            const filtered = response.data.filter((product: any) =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setResults(filtered);
        } catch (error) {
            // Error searching
        } finally {
            setLoading(false);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setResults([]);
    };

    const renderPromotion = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.promotionCard} onPress={() => router.push(`/product/${item.id}`)}>
            <Image source={{ uri: getImageUrl(item.image) }} style={styles.promotionImage} />
            {item.discount_percentage > 0 && (
                <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{item.discount_percentage}% OFF</Text>
                </View>
            )}
            <View style={styles.promotionInfo}>
                <Text style={styles.promotionName} numberOfLines={1}>{item.name}</Text>
                <View style={styles.promotionPriceRow}>
                    {item.discount_percentage > 0 && (
                        <Text style={styles.originalPrice}>KSh {item.price}</Text>
                    )}
                    <Text style={styles.promotionPrice}>KSh {item.discounted_price}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderResult = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.resultCard} onPress={() => router.push(`/product/${item.id}`)}>
            <Image source={{ uri: getImageUrl(item.image) }} style={styles.resultImage} />
            <View style={styles.resultInfo}>
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultDescription} numberOfLines={2}>{item.description}</Text>
                <Text style={styles.resultPrice}>KSh {item.price}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Search</Text>
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
                <SearchIcon color="#666" size={20} />
                <TextInput
                    placeholder="Search for food..."
                    style={styles.searchInput}
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                    autoFocus
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={clearSearch}>
                        <X color="#666" size={20} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Results or Promotions */}
            {results.length > 0 ? (
                <FlatList
                    data={results}
                    renderItem={renderResult}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.resultsList}
                    showsVerticalScrollIndicator={false}
                />
            ) : searchQuery.length > 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No results found</Text>
                    <Text style={styles.emptySubtext}>Try searching for something else</Text>
                </View>
            ) : (
                <View>
                    {promotions.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>🔥 Special Offers</Text>
                            <FlatList
                                ref={flatListRef}
                                data={promotions}
                                renderItem={renderPromotion}
                                keyExtractor={(item) => item.id.toString()}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingRight: 15 }}
                                getItemLayout={(data, index) => ({
                                    length: 170, // width 150 + margin 20
                                    offset: 170 * index,
                                    index,
                                })}
                                onScrollToIndexFailed={(info) => {
                                    const wait = new Promise(resolve => setTimeout(resolve, 500));
                                    wait.then(() => {
                                        flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
                                    });
                                }}
                            />
                        </View>
                    )}
                    <View style={styles.suggestionsContainer}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                            <TrendingUp size={20} color="#FF4500" style={{ marginRight: 8 }} />
                            <Text style={styles.suggestionsTitle}>Trending Searches</Text>
                        </View>
                        <View style={styles.chipsWrapper}>
                            {['Pizza', 'Burger', 'Pasta', 'Salad', 'Drinks', 'Cake'].map((suggestion) => (
                                <TouchableOpacity
                                    key={suggestion}
                                    style={styles.suggestionChip}
                                    onPress={() => {
                                        setSearchQuery(suggestion);
                                        handleSearch();
                                    }}
                                >
                                    <Text style={styles.suggestionText}>{suggestion}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        padding: 20,
        backgroundColor: '#FFF',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        marginHorizontal: 15,
        marginVertical: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: '#333',
    },
    section: {
        marginTop: 10,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 10,
        paddingHorizontal: 15,
    },
    promotionCard: {
        width: 150,
        marginLeft: 15,
        marginRight: 5,
        backgroundColor: '#FFF',
        borderRadius: 15,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    promotionImage: {
        width: '100%',
        height: 110,
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
    promotionInfo: {
        padding: 10,
    },
    promotionName: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    promotionPriceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    originalPrice: {
        fontSize: 11,
        color: '#999',
        textDecorationLine: 'line-through',
    },
    promotionPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FF4500',
    },
    resultsList: {
        padding: 20,
    },
    resultCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 15,
        marginBottom: 15,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    resultImage: {
        width: 100,
        height: 100,
    },
    resultInfo: {
        flex: 1,
        padding: 12,
        justifyContent: 'center',
    },
    resultName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    resultDescription: {
        fontSize: 12,
        color: '#888',
        marginBottom: 8,
    },
    resultPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF4500',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#888',
    },
    suggestionsContainer: {
        padding: 20,
    },
    suggestionsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    chipsWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    suggestionChip: {
        backgroundColor: '#FFF',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    suggestionText: {
        fontSize: 14,
        color: '#4B5563',
        fontWeight: '500',
    },
});
