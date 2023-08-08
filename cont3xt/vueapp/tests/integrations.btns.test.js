'use strict';

import Vue from 'vue';
import '@testing-library/jest-dom';
import BootstrapVue from 'bootstrap-vue';
import { render, fireEvent } from '@testing-library/vue';
import IntegrationBtns from '../src/components/integrations/IntegrationBtns.vue';
import '../../../common/vueapp/vueFilters';
import { localIndicatorId } from '@/utils/cont3xtUtil';

Vue.use(BootstrapVue);

const integrationsArray = [{
  order: 100,
  doable: true,
  name: 'Whois',
  icon: 'integrations/whois/icon.png'
}, {
  order: 120,
  doable: true,
  name: 'PT Whois',
  icon: 'integrations/passivetotal/iconWhois.png'
}];

const results = {
  domain: {
    'threatbutt.com': {
      Whois: {
        _cont3xt: {
          count: 1
        }
      },
      'PT Whois': {
        _cont3xt: {
          count: 2
        }
      }
    }
  }
};

const store = {
  state: {
    loading: false,
    integrationsArray,
    results
  },
  mutations: {
    SET_QUEUED_INTEGRATION: jest.fn()
  },
  getters: {
    getLoading (state) {
      return state.loading;
    },
    getIntegrationsArray (state) {
      return state.integrationsArray;
    },
    getResults (state) {
      return state.results;
    }
  }
};

test('Integration Btns', async () => {
  const {
    getByText, getAllByTestId, getAllByRole
  } = render(IntegrationBtns, {
    store,
    props: {
      indicatorId: localIndicatorId({
        query: 'threatbutt.com',
        itype: 'domain'
      })
    }
  });

  // displays badges
  getByText('1');
  getByText('2');

  // displays icons
  const icons = getAllByTestId('integration-btn-icon');
  for (let i = 0; i < icons.length; i++) {
    expect(icons[i].src).toBe(`http://localhost/${integrationsArray[i].icon}`);
  }

  // can click buttons
  const btns = getAllByRole('button');
  await fireEvent.click(btns[0]);

  // calls display integration mutation
  expect(store.mutations.SET_QUEUED_INTEGRATION).toHaveBeenCalledWith(store.state, {
    source: 'Whois', indicatorId: localIndicatorId({ itype: 'domain', query: 'threatbutt.com' })
  });

  // second button emits different values
  await fireEvent.click(btns[1]);
  expect(store.mutations.SET_QUEUED_INTEGRATION).toHaveBeenCalledWith(store.state, {
    source: 'PT Whois', indicatorId: localIndicatorId({ itype: 'domain', query: 'threatbutt.com' })
  });
});
