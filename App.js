import { StatusBar } from "expo-status-bar";
import React, { useState, useRef } from "react";
import { StyleSheet, Text, View, ImageBackground } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Camera } from "expo-camera";

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

	const predict_caption = async () => {
		const form = new FormData();

		form.append("image", {
			uri: photo,
			type: "image/jpg",
			name: "image.jpg",
		});

		const response = await fetch("https://...", {
			method: "POST",
			body: form,
		});

		const data = await response.json();

		const caption = data.caption;

		console.log(caption);
	};

	const __takePicture = async () => {
		if (!camera) return;
		const photo = await camera.takePictureAsync();
		console.log(photo);

		predict_caption(photo);

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
		<View style={styles.container}>
			<Camera
				style={styles.camera}
				type={type}
				ref={(ref) => {
					camera = ref;
				}}
			>
				<View
					style={{
						position: "absolute",
						bottom: 0,
						flexDirection: "row",
						flex: 1,
						width: "100%",
						padding: 20,
						justifyContent: "space-between",
					}}
				>
					<View
						style={{
							alignSelf: "center",
							flex: 1,
							alignItems: "center",
						}}
					>
						<TouchableOpacity
							activeOpacity={0.5}
							onPress={__takePicture}
							style={{
								width: 70,
								height: 70,
								bottom: 0,
								borderRadius: 50,
								backgroundColor: "#fff",
							}}
						/>
					</View>
				</View>
				<View style={styles.buttonContainer}>
					<TouchableOpacity
						style={styles.button}
						onPress={() => {
							setType(
								type === Camera.Constants.Type.back
									? Camera.Constants.Type.front
									: Camera.Constants.Type.back
							);
						}}
					>
						<Text style={styles.text}> Flip </Text>
					</TouchableOpacity>
				</View>
			</Camera>
		</View>
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
