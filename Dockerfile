# Dockerfile para el servicio weaviate

# Utiliza una imagen base adecuada
FROM semitechnologies/weaviate:1.20.1

# Expone el puerto 8080
EXPOSE 8080

# Define las variables de entorno
ENV IMAGE_INFERENCE_API=http://i2v-neural:8080 \
    QUERY_DEFAULTS_LIMIT=25 \
    AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=true \
    PERSISTENCE_DATA_PATH=/var/lib/weaviate \
    DEFAULT_VECTORIZER_MODULE=img2vec-neural \
    ENABLE_MODULES=img2vec-neural \
    CLUSTER_HOSTNAME=node1

# Agrega la red personalizada
ARG NETWORK_NAME=mynetwork
RUN echo "network: $NETWORK_NAME" >> /etc/weaviate/docker-flags.env

# Comando de inicio del contenedor
CMD ["--host", "0.0.0.0", "--port", "8080", "--scheme", "http"]
