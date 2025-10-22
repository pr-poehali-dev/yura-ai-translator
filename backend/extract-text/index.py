import json
import base64
from typing import Dict, Any
import io

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Извлечение текста из документов (PDF, DOCX, TXT)
    Args: event с httpMethod, body (file_content в base64, file_type)
          context с request_id
    Returns: HTTP response с извлеченным текстом
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        file_content_b64 = body_data.get('file_content', '')
        file_type = body_data.get('file_type', '').lower()
        
        if not file_content_b64:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'File content is required'}),
                'isBase64Encoded': False
            }
        
        file_bytes = base64.b64decode(file_content_b64)
        extracted_text = ''
        
        if file_type == 'txt' or file_type == 'text/plain':
            extracted_text = file_bytes.decode('utf-8', errors='ignore')
        
        elif file_type == 'pdf' or file_type == 'application/pdf':
            import PyPDF2
            pdf_file = io.BytesIO(file_bytes)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            
            for page in pdf_reader.pages:
                extracted_text += page.extract_text() + '\n'
        
        elif file_type in ['docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']:
            import docx
            doc_file = io.BytesIO(file_bytes)
            doc = docx.Document(doc_file)
            
            for paragraph in doc.paragraphs:
                extracted_text += paragraph.text + '\n'
        
        else:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': f'Unsupported file type: {file_type}'}),
                'isBase64Encoded': False
            }
        
        if not extracted_text.strip():
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'No text found in document'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'extracted_text': extracted_text.strip(),
                'text_length': len(extracted_text.strip()),
                'file_type': file_type
            })
        }
        
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Invalid JSON'}),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
