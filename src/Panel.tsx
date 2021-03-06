import React from 'react';
import { css, cx } from 'emotion';
import { PanelProps } from '@grafana/data';
import { stylesFactory } from '@grafana/ui';
import { TimepickerData } from 'types';
import { TimepickerButton } from 'TimepickerButton';

interface Props extends PanelProps<> {}

export const Panel: React.FC<Props> = ({ options, data, width, height }) => {
  const styles = getStyles();

  // Convert data retrieved from datasource into a data structure we can process into <button> elements
  const buttons: TimepickerData[] = [];
  data.series.forEach(series => {
    let button: TimepickerData = {
      text: series.fields.find(field => field.name === 'button_text')?.values.get(0),
      Dt: series.fields.find(field => field.name === 'Dt')?.values.get(0),
      time_to: series.fields.find(field => field.name === 'time_to')?.values.get(0),
      errors: [],
    };

    // Sanitize primary
    let primary = series.fields.find(field => field.name === 'primary')?.values.get(0);
    if (typeof primary !== 'undefined' && primary !== null) {
      if (primary === 1 || primary === '1') {
        button.primary = true;
      }
    }

    // Sanitize Dt
    if (typeof button.Dt === 'undefined' || button.Dt === null) {
      button.errors.push('Dt column is required');
    } else {
      // Check it's a valid UNIX timestamp
      button.Dt = Number(button.Dt);
      if (isNaN(button.Dt)) {
        button.errors.push('Dt is not a valid UNIX timestamp');
      } else if (typeof button.text === 'undefined' || button.text === null) {
        // If there's no button_text column then just default to a formatted timestamp appropriate for the user's locale
        button.text = new Date(button.Dt).toLocaleString();
      } else {
        // Make sure text is a string
        button.text = String(button.text);
      }
    }

    // Sanitize time_to
    if (typeof button.time_to !== 'undefined' && button.time_to !== null) {
      // Check it's a valid UNIX timestamp
      button.time_to = Number(button.time_to);
      if (isNaN(button.time_to)) {
        button.errors.push('time_to is not a valid UNIX timestamp');
      }
    }

    buttons.push(button);
  });

  return (
    <div
      className={cx(
        styles.wrapper,
        css`
          width: ${width}px;
          height: ${height}px;
        `
      )}
    >
      {buttons.map(button => (
        <TimepickerButton
          text={button.text}
          Dt={button.Dt}
          time_to={button.time_to}
          primary={button.primary}
          errors={button.errors}
        ></TimepickerButton>
      ))}
    </div>
  );
};

const getStyles = stylesFactory(() => {
  return {
    wrapper: css`
      position: relative;
      overflow-y: auto;
    `,
  };
});
