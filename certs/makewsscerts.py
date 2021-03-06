#!/usr/bin/env python
# **********************************************************************
#
# Copyright (c) 2003-2014 ZeroC, Inc. All rights reserved.
#
# This copy of Ice is licensed to you under the terms described in the
# ICE_LICENSE file included in this distribution.
#
# **********************************************************************

import os, sys, shutil, glob, socket

def usage():
    print("usage: " + sys.argv[0] + " [ip address]")
    sys.exit(1)

debug = True
ipAddress = None
if len(sys.argv) == 2:
    ipAddress = sys.argv[1]

if not ipAddress:
    try:
        ipAddress = socket.gethostbyname(socket.gethostname())
    except:
        ipAddress = "127.0.0.1"

cwd = os.getcwd()
if not os.path.exists("makewsscerts.py") or os.path.basename(cwd) != "certs":
    print("You must run this script from the certs demo directory")
    sys.exit(1)

if os.path.exists("wss"):
    shutil.rmtree("wss")
os.mkdir("wss")

os.environ["ICE_CA_HOME"] = os.path.abspath("wss")

os.chdir("wss")

while True:
    print("The IP address used for the server certificate will be: " + ipAddress)

    sys.stdout.write("Do you want to keep this IP address? (y/n) [y]")
    sys.stdout.flush()
    input = sys.stdin.readline().strip()
    if input == 'n':
        sys.stdout.write("IP : ")
        sys.stdout.flush()
        ipAddress = sys.stdin.readline().strip()
    else:
        break

certs = "."
caHome = os.path.join(certs, "ca")

caKey = os.path.join(certs, "cakey.pem")
caCert = os.path.join(certs, "cacert.pem")

print("Generating new CA certificate and key...")
os.mkdir(caHome)

f = open(os.path.join(caHome, "serial"), "w")
f.write("01")
f.close()

f = open(os.path.join(caHome, "index.txt"), "w")
f.truncate(0)
f.close()

#
# Static configuration file data.
#
configFiles = {\
"ca.cnf":"\
# **********************************************************************\n\
#\n\
# Copyright (c) 2003-2014 ZeroC, Inc. All rights reserved.\n\
#\n\
# This copy of Ice is licensed to you under the terms described in the\n\
# ICE_LICENSE file included in this distribution.\n\
#\n\
# **********************************************************************\n\
\n\
# Configuration file for the CA. This file is generated by iceca init.\n\
# DO NOT EDIT!\n\
\n\
###############################################################################\n\
###  Self Signed Root Certificate\n\
###############################################################################\n\
\n\
[ ca ]\n\
default_ca = ice\n\
\n\
[ ice ]\n\
default_days     = 1825    # How long certs are valid.\n\
default_md       = sha256  # The Message Digest type.\n\
preserve         = no      # Keep passed DN ordering?\n\
\n\
[ req ]\n\
default_bits        = 2048\n\
default_keyfile     = $ENV::ICE_CA_HOME/ca/cakey.pem\n\
default_md          = sha256\n\
prompt              = no\n\
distinguished_name  = dn\n\
x509_extensions     = extensions\n\
\n\
[ extensions ]\n\
basicConstraints = CA:true\n\
\n\
# PKIX recommendation.\n\
subjectKeyIdentifier = hash\n\
authorityKeyIdentifier = keyid:always,issuer:always\n\
\n\
[dn]\n\
countryName            = US\n\
stateOrProvinceName    = Florida\n\
localityName           = Palm Beach Gardens\n\
organizationName       = ZeroC, Inc.\n\
organizationalUnitName = Ice\n\
commonName             = ZeroC WSS Test CA\n\
emailAddress           = info@zeroc.com\n\
",\
"ice.cnf":"\
# **********************************************************************\n\
#\n\
# Copyright (c) 2003-2014 ZeroC, Inc. All rights reserved.\n\
#\n\
# This copy of Ice is licensed to you under the terms described in the\n\
# ICE_LICENSE file included in this distribution.\n\
#\n\
# **********************************************************************\n\
\n\
# Configuration file to sign a certificate. This file is generated by iceca init.\n\
# DO NOT EDIT!!\n\
\n\
[ ca ]\n\
default_ca = ice\n\
\n\
[ ice ]\n\
dir              = $ENV::ICE_CA_HOME/ca # Where everything is kept.\n\
private_key      = $dir/cakey.pem   # The CA Private Key.\n\
certificate      = $dir/cacert.pem  # The CA Certificate.\n\
database         = $dir/index.txt           # Database index file.\n\
new_certs_dir    = $dir                     # Default loc for new certs.\n\
serial           = $dir/serial              # The current serial number.\n\
certs            = $dir                     # Where issued certs are kept.\n\
RANDFILE         = $dir/.rand               # Private random number file.\n\
default_days     = 1825                     # How long certs are valid.\n\
default_md       = sha256                      # The Message Digest type.\n\
preserve         = yes                      # Keep passed DN ordering?\n\
\n\
policy           = ca_policy\n\
x509_extensions  = certificate_extensions\n\
\n\
[ certificate_extensions ]\n\
basicConstraints = CA:false\n\
\n\
# PKIX recommendation.\n\
subjectKeyIdentifier = hash\n\
authorityKeyIdentifier = keyid:always,issuer:always\n\
subjectAltName         = DNS:{0}, IP:{1}\n\
\n\
[ ca_policy ]\n\
countryName            = match\n\
stateOrProvinceName    = match\n\
organizationName       = match\n\
organizationalUnitName = optional\n\
emailAddress           = optional\n\
commonName             = supplied\n\
\n\
[ req ]\n\
default_bits        = 1024\n\
default_md          = sha256\n\
prompt              = no\n\
distinguished_name  = dn\n\
x509_extensions     = extensions\n\
\n\
[ extensions ]\n\
basicConstraints = CA:false\n\
\n\
# PKIX recommendation.\n\
subjectKeyIdentifier = hash\n\
authorityKeyIdentifier = keyid:always,issuer:always\n\
keyUsage = nonRepudiation, digitalSignature, keyEncipherment\n\
\n\
[dn]\n\
countryName            = US\n\
stateOrProvinceName    = Florida\n\
localityName           = Palm Beach Gardens\n\
organizationName       = ZeroC, Inc.\n\
organizationalUnitName = Ice\n\
commonName             = {2}\n\
emailAddress           = info@zeroc.com\n\
" }

def generateConf(file, dns = None, ip = None, commonName = None):
    sys.stdout.write("Generating configuration files... " + file)
    sys.stdout.flush()
    cnf = open(os.path.join(caHome, file), "w")
    if dns and ip and commonName:
        cnf.write(configFiles[file].format(dns, ip, commonName))
    else:
        cnf.write(configFiles[file])
    cnf.close()
    print("")

generateConf("ca.cnf")

config = os.path.join(caHome, "ca.cnf")
cmd = "openssl req -config " + config + " -x509 -days 1825 -newkey rsa:1024 -out " + \
    os.path.join(caHome, "cacert.pem") + " -outform PEM -nodes"
if debug:
    print("[debug]", cmd)
os.system(cmd)
shutil.copyfile(os.path.join(caHome, "cakey.pem"), caKey)
shutil.copyfile(os.path.join(caHome, "cacert.pem"), caCert)

cmd = "openssl x509 -in " + caCert + " -outform DER -out " + os.path.join(certs, "cacert.der")
os.system(cmd)

def generateCert(name, commonName = ipAddress):

    generateConf("ice.cnf", ipAddress, ipAddress, commonName)

    cppServerCert = os.path.join(certs, name + "_rsa1024_pub.pem")
    cppServerKey = os.path.join(certs, name + "_rsa1024_priv.pem")
    print("Generating new C++ RSA certificate and key...")

    if os.path.exists(cppServerCert):
        os.remove(cppServerCert)
    if os.path.exists(cppServerKey):
        os.remove(cppServerKey)

    serial = os.path.join(caHome, "serial")
    f = open(serial, "r")
    serialNum = f.read().strip()
    f.close()

    tmpKey = os.path.join(caHome, serialNum + "_key.pem")
    tmpCert = os.path.join(caHome, serialNum + "_cert.pem")
    req = os.path.join(caHome, "req.pem")
    config = os.path.join(caHome, "ice.cnf")
    cmd = "openssl req -config " + config + " -newkey rsa:1024 -nodes -keyout " + tmpKey + " -keyform PEM -out " + req
    if debug:
        print("[debug]", cmd)
    os.system(cmd)

    cmd = "openssl ca -config " + config + " -batch -in " + req
    if debug:
        print("[debug]", cmd)
    os.system(cmd)
    shutil.move(os.path.join(caHome, serialNum + ".pem"), tmpCert)
    shutil.copyfile(tmpKey, cppServerKey)
    shutil.copyfile(tmpCert, cppServerCert)
    os.remove(req)
    
generateCert("s")
generateCert("c", "client")

#
# Done.
#
print("Done.")
os.chdir("..")
