import os
import platform
import fileinput

def main():
    if (not os.path.isfile(os.path.join(os.getcwd(), 'pm2.config.js'))):
        raise FileNotFoundError('Launch this script in the projects root directory.')

    if (platform.system() != 'Linux'):
        raise OSError('Only Linux is supported by this script.')

    if (os.getuid() != 0):
        raise PermissionError('Run this script as sudo.')

    user = os.environ['SUDO_USER']

    with fileinput.FileInput('/etc/systemd/system/pm2-{}.service'.format(user), inplace=True, backup='.bak') as file:
        for line in file:
            print(line.replace('Type=forking', 'Type=simple'), end='')


if __name__ == "__main__":
  main()
