import { Image, SafeAreaView, StyleSheet, Text, View } from "react-native";
import OnboardImage from "../assets/piklup-onboard.png";
import LoadingButton, { OutlinedButton } from "../components/Button";

const Onboarding = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Image source={OnboardImage} style={styles.image} />

      <View style={{ marginTop: 54, alignItems: "center" }}>
        <Text
          style={{
            fontSize: 22,
            textAlign: "center",
            width: 300,
            lineHeight: 34,
          }}
        >
          Get Anything Delivered Anywhere, Anytime
        </Text>

        <Text
          style={{
            textAlign: "center",
            marginTop: 18,
            fontSize: 16,
            color: "#888888",
          }}
        >
          Your trusted partner for fast and reliable delivery. Let us handle
          your pickups and drop-offs, anytime, anywhere.
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 20,
          marginTop: 54
        }}
      >
        <View style={{ flex: 1 }}>
          <LoadingButton title={"Create Account"} />
        </View>
        <View style={{ flex: 1 }}>
          <OutlinedButton title={"Login"} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 339,
    height: 252,
  },
});

export default Onboarding;
