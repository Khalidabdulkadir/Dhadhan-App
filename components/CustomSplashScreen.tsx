import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function CustomSplashScreen() {
    return (
        <View style={styles.container}>
            <StatusBar hidden={true} />
            <Image
                source={require('../assets/images/icon.png')}
                style={styles.logo}
                resizeMode="contain"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FF4500', // Orange
        justifyContent: 'center',
        alignItems: 'center',
        width: width,
        height: height,
    },
    logo: {
        width: 180,
        height: 180,
    },
});
