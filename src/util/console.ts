const myTime: () => string = () => {
  return new Date().toLocaleString();
};

/* tslint:disable:no-console */

export const status = (message: string) => {
  const FgGreen: string = '\x1b[32m%s\x1b[0m';

  return console.info(FgGreen, `${myTime()}: ${message}`);
};

export const error = (message: string) => {
    const FgRed: string = '\x1b[31m%s\x1b[0m';

    // @ts-ignore
    return console.error(FgRed, `${myTime()}: ${message.stack || message}`);
  };

export const warn = (message: string) => {
    const FgYellow: string = '\x1b[33m%s\x1b[0m';

    return console.warn(FgYellow, `${myTime()}: ${message}`);
};

/* tslint:enable:no-console */
