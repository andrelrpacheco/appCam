import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {RNCamera} from 'react-native-camera';
import CameraRoll from '@react-native-community/cameraroll';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

const App: React.FC = () => {
  const [typeCamera, setTypeCamera] = useState(RNCamera.Constants.Type.back);
  const [open, setOpen] = useState(false);
  const [capturePhoto, setCapturePhoto] = useState(null);

  const permissionCamera = ({
    camera,
    status,
    recordAndroidPermissionStatus,
  }) => {
    if (status !== 'READY') {
      return <View />;
    }
    return (
      <View style={styles.viewCapture}>
        <TouchableOpacity
          style={styles.capture}
          onPress={() => takePicture(camera)}>
          <Text style={{fontSize: 17, color: '#fff'}}>Tirar foto</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.capture} onPress={openGalery}>
          <Text style={{fontSize: 17, color: '#fff'}}>Galeria</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const takePicture = async camera => {
    const options = {quality: 0.5, base64: true};
    const data = await camera.takePictureAsync(options);

    setCapturePhoto(data.uri);
    setOpen(true);

    savePhoto(data.uri);
  };

  async function hasAndroidPermission() {
    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
    const hasPermission = await PermissionsAndroid.check(permission);

    if (hasPermission) {
      return true;
    }

    const status = await PermissionsAndroid.request(permission);
    return status === 'granted';
  }

  async function savePhoto(data: string) {
    if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
      return;
    }

    CameraRoll.save(data, 'photo')
      .then(res => {
        console.log('Foto salva com sucesso', res);
      })
      .catch(error => {
        console.log('Erro ao salvar a foto', error);
      });
  }

  function toggleCam() {
    setTypeCamera(
      typeCamera === RNCamera.Constants.Type.back
        ? RNCamera.Constants.Type.front
        : RNCamera.Constants.Type.back,
    );
  }

  function openGalery() {
    const options = {
      title: 'Selecione uma foto',
      chooseFromLibraryButtonTitle: 'Buscar foto da galeria',
      noData: true,
      mediaType: 'photo',
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('Imagem cancelada');
      } else if (response.errorMessage) {
        console.log('Ocorreu um erro!', response.errorMessage);
      } else {
        console.log(response.assets[0].uri);
        setCapturePhoto(response.assets[0].uri);
        setOpen(true);
      }
    });
  }

  return (
    <View style={styles.container}>
      <RNCamera
        style={styles.preview}
        type={typeCamera}
        flashMode={RNCamera.Constants.FlashMode.auto}
        androidCameraPermissionOptions={{
          title: 'Permissão para usar a câmera',
          message: 'Precisamos de sua permissão para usar sua câmera',
          buttonPositive: 'Permitir',
          buttonNegative: 'Cancelar',
        }}>
        {permissionCamera}
      </RNCamera>

      <View style={styles.camPosition}>
        <TouchableOpacity onPress={toggleCam}>
          <Text>Trocar</Text>
        </TouchableOpacity>
      </View>

      {capturePhoto && (
        <Modal animationType="slide" transparent={false} visible={open}>
          <View style={styles.viewModal}>
            <TouchableOpacity
              style={{margin: 10}}
              onPress={() => setOpen(false)}>
              <Text style={{fontSize: 20}}>Fechar</Text>
            </TouchableOpacity>

            <Image
              style={{width: 350, height: 450, borderRadius: 15}}
              resizeMode="contain"
              source={{uri: capturePhoto}}
            />
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  viewCapture: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  capture: {
    backgroundColor: '#161616',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
  viewModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
  },
  camPosition: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    height: 40,
    position: 'absolute',
    right: 25,
    top: 60,
  },
});

export default App;
