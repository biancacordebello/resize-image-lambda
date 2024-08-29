import { S3Client, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client();

export const handler = async (event) => {
  try {
    // Evento de upload do s3
    const s3Event = event.Records[0].s3;
    const bucketName = s3Event.bucket.name;
    const fileName = s3Event.object.key;

    // Informações sobre arquivo do S3
    const params = {
      Bucket: bucketName,
      Key: fileName
    };

    // Obtém o tamanho do arquivo do S3
    const fileInfo = await s3Client.send(new HeadObjectCommand(params));
    const fileSizeInBytes  = fileInfo.ContentLength;

    // Converter em MB
    const fileSizeInMB = fileSizeInBytes / (1024 * 1024);

    // Verifica se o arquivo é maior que 10MB
    const isFileLargerThan10MB = fileSizeInMB > 1;

    // Imprimir o resultado
    console.log(`O arquivo ${fileName} tem tamanho: ${fileSizeInMB.toFixed(2)} MB.`);
    console.log(`O arquivo ${fileName} é ${isFileLargerThan10MB ? 'maior' : 'menor'} que 10MB.`);

    if (isFileLargerThan10MB) {
      // Exclui o arquivo do bucket
      await s3Client.send(new DeleteObjectCommand(params));
      console.log(`O arquivo ${fileName} foi excluído do bucket.`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Arquivo processado com sucesso' })
    };
  } catch (error) {
    console.error('Erro ao processar o arquivo:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro ao processar o arquivo.' })
    };
  }
}
