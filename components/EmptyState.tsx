import { PackageOpen } from 'lucide-react-native';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

interface EmptyStateProps {
    title?: string;
    message?: string;
    actionLabel?: string;
    onAction?: () => void;
    image?: any; // strict typing for images is tricky in RN, any is often practical
    style?: ViewStyle;
}

export default function EmptyState({
    title = "No Data Found",
    message = "It looks like there's nothing here yet.",
    actionLabel,
    onAction,
    image,
    style
}: EmptyStateProps) {
    return (
        <View style={[styles.container, style]}>
            <View style={styles.iconContainer}>
                {image ? (
                    <Image source={image} style={styles.image} resizeMode="contain" />
                ) : (
                    <PackageOpen size={48} color="#9CA3AF" strokeWidth={1.5} />
                )}
            </View>

            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>

            {actionLabel && onAction && (
                <TouchableOpacity style={styles.button} onPress={onAction} activeOpacity={0.8}>
                    <Text style={styles.buttonText}>{actionLabel}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    iconContainer: {
        marginBottom: 16,
        width: 100,
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 50,
    },
    image: {
        width: '60%',
        height: '60%',
        opacity: 0.8
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
        maxWidth: '80%',
    },
    button: {
        backgroundColor: '#FF4500',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 100,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
});
