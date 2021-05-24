import { StatusBar } from "expo-status-bar";
import React, { useState, useRef } from "react";
import { StyleSheet, Text, View, ImageBackground } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Camera } from "expo-camera";
import * as Speech from "expo-speech";

export default function App() {
	const [hasPermission, setHasPermission] = useState(null);
	const [type, setType] = useState(Camera.Constants.Type.back);

	const [previewVisible, setPreviewVisible] = useState(false);
	const [capturedImage, setCapturedImage] = useState(null);

	let camera;

	const __retakePicture = () => {
		setCapturedImage(null);
		setPreviewVisible(false);
		__startCamera();
	};

	const __startCamera = async () => {
		const { status } = await Camera.requestPermissionsAsync();
		setHasPermission(status === "granted");
	};

	const predict_caption = async (uri) => {
		let formData = new FormData();
		formData.append("file", {
			uri,
			name: "image.jpg",
			type: "image/jpeg",
		});

		let options = {
			method: "POST",
			body: formData,
			headers: {
				Accept: "/",
				"Content-Type": "multipart/form-data",
			},
		};

		const apiUrl = "https://cryptic-beach-09117.herokuapp.com/predict";

		try {
			const res = await fetch(apiUrl, options);
			const data = await res.text();
			console.log("Genrating Caption.......");
			console.log(data);
			Speech.speak(data);
			setPreviewVisible(false);
		} catch (error) {
			console.log(error.message);
		}
	};

	const __takePicture = async () => {
		if (!camera) return;
		const photo = await camera.takePictureAsync();
		console.log(photo);

		predict_caption(photo.uri);

		setPreviewVisible(true);
		setCapturedImage(photo);
	};

	const __savePhoto = () => {};

	if (hasPermission === null) {
		return (
			<View style={styles.container}>
				<View
					style={{
						flex: 1,
						backgroundColor: "#fff",
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					<TouchableOpacity
						onPress={__startCamera}
						style={{
							width: 130,
							borderRadius: 4,
							backgroundColor: "#14274e",
							flexDirection: "row",
							justifyContent: "center",
							alignItems: "center",
							height: 40,
						}}
					>
						<Text
							style={{
								color: "#fff",
								fontWeight: "bold",
								textAlign: "center",
							}}
						>
							Take picture
						</Text>
					</TouchableOpacity>
				</View>

				<StatusBar style="auto" />
			</View>
		);
	}
	if (hasPermission === false) {
		return <Text>No access to camera</Text>;
	}
	return previewVisible && capturedImage ? (
		<CameraPreview
			photo={capturedImage}
			savePhoto={__savePhoto}
			retakePicture={__retakePicture}
		/>
	) : (
		<Camera
			style={{ height: "100%", width: "100%" }}
			type={type}
			ref={(ref) => {
				camera = ref;
			}}
		>
			<TouchableOpacity
				style={{ width: "100%", height: "100%" }}
				onPress={__takePicture}
			></TouchableOpacity>
		</Camera>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	camera: {
		flex: 1,
	},
	buttonContainer: {
		flex: 1,
		backgroundColor: "transparent",
		flexDirection: "row",
		margin: 20,
	},
	button: {
		flex: 0.1,
		alignSelf: "flex-end",
		alignItems: "center",
	},
	text: {
		fontSize: 18,
		color: "white",
	},
});

const CameraPreview = ({ photo, retakePicture, savePhoto }) => {
	console.log("Photo Preview", photo);
	return (
		<View
			style={{
				backgroundColor: "transparent",
				flex: 1,
				width: "100%",
				height: "100%",
			}}
		>
			<ImageBackground
				source={{ uri: photo && photo.uri }}
				style={{
					flex: 1,
				}}
			>
				<View
					style={{
						flex: 1,
						flexDirection: "column",
						padding: 15,
						justifyContent: "flex-end",
					}}
				>
					<View
						style={{
							flexDirection: "row",
							justifyContent: "space-between",
						}}
					>
						<TouchableOpacity
							onPress={retakePicture}
							style={{
								width: 130,
								height: 40,

								alignItems: "center",
								borderRadius: 4,
							}}
						>
							<Text
								style={{
									color: "#fff",
									fontSize: 20,
								}}
							>
								Re-take
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={savePhoto}
							style={{
								width: 130,
								height: 40,

								alignItems: "center",
								borderRadius: 4,
							}}
						>
							<Text
								style={{
									color: "#fff",
									fontSize: 20,
								}}
							>
								save photo
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</ImageBackground>
		</View>
	);
};
