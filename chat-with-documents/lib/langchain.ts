
import {ChatOpenAI} from '@langchain/openai';
import {PDFLoader} from '@langchain/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitterParams  } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from '@langchain/openai';
import {createStuffDocumentsChain} from '@langchain/chains/combine_documents';

const model = new ChatOpenAI({  
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: 'gpt-4o',
})