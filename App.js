import { StatusBar } from "expo-status-bar";
import React, { useState, useRef } from "react";
import {
	StyleSheet,
	Text,
	ActivityIndicator,
	View,
	ImageBackground,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Camera } from "expo-camera";
import * as Speech from "expo-speech";

export default function App() {
	const [hasPermission, setHasPermission] = useState(null);
	const [type, setType] = useState(Camera.Constants.Type.back);

	const [previewVisible, setPreviewVisible] = useState(false);
	const [capturedImage, setCapturedImage] = useState(null);
	const [caption, setCaption] = useState("");

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
			Speech.speak("Genrating Caption....");
			const res = await fetch(apiUrl, options);
			let caption = await res.text();

			console.log("Genrating Caption.......");
			console.log(caption, caption.length);
			if (caption.length > 150) {
				console.log("Is it True");
				caption = "Heroku Server is Busy";
				Speech.speak(caption);
				setCaption(caption);
			} else {
				Speech.speak(caption);
				setCaption(caption);
			}
			Speech.isSpeakingAsync()
				.then((isfinshed) => {
					if (isfinshed) {
						Speech.speak("Long Press to take a Picture Again");
					}
				})
				.catch((err) => {
					console.error(err);
				});
		} catch (error) {
			console.log(error.message);
		}
	};

	const predict_caption_from_an_API = async (uri) => {
		let formData = new FormData();
		formData.append("image", {
			uri,
			name: "image.jpg",
			type: "image/jpeg",
		});

		let options = {
			method: "POST",
			body: formData,
			headers: {
				Accept: "/",
				// "Content-Type": "multipart/form-data",
			},
		};

		const apiUrl =
			"http://max-image-caption-generator.codait-prod-41208c73af8fca213512856c7a09db52-0000.us-east.containers.appdomain.cloud/model/predict";

		try {
			Speech.speak("Genrating Caption....");
			const res = await fetch(apiUrl, options);
			const data = await res.json();
			console.log("Genrating Caption.......");
			console.log(data["predictions"]);
			const caption = data["predictions"][0]["caption"];
			Speech.speak(caption);
			setCaption(caption);
			Speech.isSpeakingAsync()
				.then((isfinshed) => {
					if (isfinshed) {
						Speech.speak("Long Press to take a Picture Again");
					}
				})
				.catch((err) => {
					console.error(err);
				});
		} catch (error) {
			console.log(error);
		}
	};

	const __takePicture = async () => {
		if (!camera) return;
		const photo = await camera.takePictureAsync();
		console.log(photo);
		setCaption("");
		setPreviewVisible(true);
		// predict_caption(photo.uri);
		predict_caption_from_an_API(photo.uri);
		setCapturedImage(photo);
	};

	const __savePhoto = () => {};

	if (hasPermission == (null || false)) {
		console.log(hasPermission);
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
	if (!previewVisible)
		Speech.speak("Tap Any Where on the Screen to Take Picture");
	return previewVisible && capturedImage ? (
		<CameraPreview
			photo={capturedImage}
			savePhoto={__savePhoto}
			retakePicture={__retakePicture}
			setPreviewVisible={setPreviewVisible}
			caption={caption}
		></CameraPreview>
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

const CameraPreview = ({
	photo,
	retakePicture,
	savePhoto,
	setPreviewVisible,
	caption,
}) => {
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
				<TouchableOpacity
					style={{ width: "100%", height: "100%" }}
					onLongPress={() => {
						setPreviewVisible(false);
					}}
				>
					<Text
						style={{
							textAlign: "center", // <-- the magic
							fontWeight: "bold",
							justifyContent: "center",
							fontSize: 28,
							padding: 70,
							height: "100%",
							width: "100%",
							color: "white",
						}}
					>
						{caption}
					</Text>
					{/* <View
						style={{
							justifyContent: "center",
						}}
					>
						<ActivityIndicator size="large" color="#0000ff" />
					</View> */}
				</TouchableOpacity>
			</ImageBackground>
		</View>
	);
};
