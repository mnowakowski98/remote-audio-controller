cd server
if [ -e keys ]
then rm -r keys
fi
mkdir keys
cd keys

openssl genrsa -out remote-audio-controller-key.pem 2048
openssl req -new -sha256 -key remote-audio-controller-key.pem -out csr.csr -config ../certconfig
openssl req -x509 -sha256 -days 365 -key remote-audio-controller-key.pem -in csr.csr -out remote-audio-controller-cert.pem
rm csr.csr

cd ../../ui

if [ -e keys ]
then rm -r keys
fi
mkdir keys
cd keys

openssl genrsa -out remote-audio-controller-key.pem 2048
openssl req -new -sha256 -key remote-audio-controller-key.pem -out csr.csr -config ../certconfig
openssl req -x509 -sha256 -days 365 -key remote-audio-controller-key.pem -in csr.csr -out remote-audio-controller-cert.pem
rm csr.csr