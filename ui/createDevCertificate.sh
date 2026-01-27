if [ -e keys ]
then rm -r keys
fi
mkdir keys
cd keys

openssl genrsa -out key.pem 2048
openssl req -new -sha256 -key key.pem -out csr.csr
openssl req -x509 -sha256 -days 365 -key key.pem -in csr.csr -out remote-audio-controller-dev.pem