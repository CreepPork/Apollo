import os
import platform
import fileinput
import subprocess

def main():
    if (not os.path.isfile(os.path.join(os.getcwd(), 'pm2.config.js'))):
        raise FileNotFoundError('Launch this script in the projects root directory.')

    if (platform.system() != 'Linux'):
        raise OSError('Only Linux is supported by this script.')

    if (os.getuid() == 0):
        raise PermissionError('Do not run this script as sudo.')

    user = subprocess.check_output('whoami', shell=True).strip().decode('utf-8')

    didFail = os.system('npm i pm2 -g')

    if (didFail == 1):
        os.system('sudo npm i pm2 -g')

    os.system('pm2 start pm2.config.js')
    os.system('pm2 startup systemd | tail -1 | bash')
    os.system('pm2 save')

    os.system('sudo python3 __writeToService.py')

    os.system('sudo systemctl daemon-reload')
    os.system('sudo systemctl start pm2-{}'.format(user))

    print('pm2 setup is completed.')


if __name__ == "__main__":
  main()
