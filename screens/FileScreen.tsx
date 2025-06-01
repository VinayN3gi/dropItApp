import { View, Text } from 'react-native';
import React, { useEffect } from 'react';
import { useAuth } from 'context/AuthContext';
import { Models } from 'appwrite';
import { getFiles } from 'appwrite/fileAction';

const FileScreen = () => {
    const { authUser }: { authUser: Models.User<any> } = useAuth();

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const result = await getFiles({
                    email: authUser.email,
                    userId: authUser.$id,
                    searchText: ' ',
                    sortText: undefined,
                });
                console.log(result.documents);
            } catch (error) {
                console.log(error);
            }
        };
        fetchFiles();
    }, []);

    return (
        <View>
            <Text>FileScreen</Text>
        </View>
    );
};

export default FileScreen;