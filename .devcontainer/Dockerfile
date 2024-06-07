# syntax=docker/dockerfile:1

ARG VARIANT="18"
ARG CAPVER="latest"
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-${VARIANT}

# Install some generally useful tools
RUN apt-get update \
    && apt-get -y install --no-install-recommends \
    jq procps curl git sqlite3 entr source-highlight



ARG USER_HOME=/home/node
RUN curl --location --silent "https://packages.cloudfoundry.org/stable?release=linux64-binary&version=v8&source=github" | tar -zx -C /usr/local/bin && \
    cf --version

# Install SAP CAP and support packages globally
USER node
RUN npm install -g @sap/cds-dk@$CAPVER
RUN npm install -g mbt
RUN npm install -g mta
RUN npm install -g @sap/generator-fiori
RUN npm install -g @ui5/cli


# vi mode everywhere and nicer prompt 
RUN cat <<EOBASHRC >> ${USER_HOME}/.bashrc
export EDITOR=vi
set -o vi
bind -x '"\C-l": clear'
EOBASHRC

RUN echo 'export PS1=${PS1/\$ /\\\\n$ }' >> /home/node/.bashrc

WORKDIR ${USER_HOME}

ARG MTA_PLUGIN_VERSION=3.2.2
ARG MTA_PLUGIN_URL=https://github.com/cloudfoundry/multiapps-cli-plugin/releases/download/v${MTA_PLUGIN_VERSION}/multiapps-plugin.linuxarm64
ENV MULTIAPPS_DISABLE_UPLOAD_PROGRESS_BAR=true
ARG CSPUSH_PLUGIN_VERSION=1.3.2
ARG CSPUSH_PLUGIN_URL=https://github.com/dawu415/CF-CLI-Create-Service-Push-Plugin/releases/download/${CSPUSH_PLUGIN_VERSION}/CreateServicePushPlugin.linuxarm64

RUN cf add-plugin-repo CF-Community https://plugins.cloudfoundry.org && \
    # cf install-plugin blue-green-deploy -f -r CF-Community && \
    # cf install-plugin ${MTA_PLUGIN_URL} -f && \
    cf install-plugin -r CF-Community "multiapps" -f && \
    # cf install-plugin ${CSPUSH_PLUGIN_URL} -f && \
    cf install-plugin -r CF-Community "html5-plugin" -f && \
    cf plugins

# allow anybody to read/write/exec at HOME
RUN chmod -R o+rwx "${USER_HOME}"
ENV HOME=${USER_HOME}

COPY --chmod=755 cf-aic-test-login.sh /workspaces/scripts/cf-aic-test-login.sh
COPY --chmod=755 cf-aic-dev-login.sh /workspaces/scripts/cf-aic-dev-login.sh
COPY --chmod=755 cf-aic-poc-login.sh /workspaces/scripts/cf-aic-poc-login.sh