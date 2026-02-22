#!/usr/bin/env python3
"""
AIASF n8n 워크플로우 자동 업데이트 스크립트
v6.18 + v5.1 + v20.39 적용
"""

import json
import requests

# n8n API 설정
N8N_URL = "http://38.60.220.9:5678"
API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZDRkODUzNy1mOTg2LTRjZmMtYjNlYS1kMDBiYjE4ZmI4OWEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzcxNjczMjU1fQ.EvEuGD-WYbfQ4X2-c_ytjqrOW6FjWNKbanRQjffRBXU"
WORKFLOW_ID = "mhPPIHjYTH4sFUDK"

headers = {
    "X-N8N-API-KEY": API_KEY,
    "Content-Type": "application/json"
}

def get_workflow():
    """워크플로우 가져오기"""
    url = f"{N8N_URL}/api/v1/workflows/{WORKFLOW_ID}"
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.json()

def clean_nodes(nodes):
    """노드에서 불필요한 필드 제거"""
    cleaned = []
    for node in nodes:
        # 필수 필드만 유지
        clean_node = {
            'name': node['name'],
            'type': node['type'],
            'position': node['position'],
            'parameters': node['parameters']
        }
        # 선택적 필드 추가
        if 'typeVersion' in node:
            clean_node['typeVersion'] = node['typeVersion']
        if 'credentials' in node:
            clean_node['credentials'] = node['credentials']
        if 'disabled' in node:
            clean_node['disabled'] = node['disabled']
        cleaned.append(clean_node)
    return cleaned

def update_workflow(workflow_data):
    """워크플로우 업데이트"""
    # 노드 정리
    workflow_data['nodes'] = clean_nodes(workflow_data['nodes'])

    # PUT 요청 시 필수 필드만 전송
    clean_data = {
        'name': workflow_data['name'],
        'nodes': workflow_data['nodes'],
        'connections': workflow_data['connections'],
        'settings': workflow_data.get('settings', {}),
        'staticData': workflow_data.get('staticData')
    }

    # None 값 제거
    clean_data = {k: v for k, v in clean_data.items() if v is not None}

    url = f"{N8N_URL}/api/v1/workflows/{WORKFLOW_ID}"
    response = requests.put(url, headers=headers, json=clean_data)
    if response.status_code != 200:
        print(f"❌ HTTP {response.status_code}: {response.text}")
    response.raise_for_status()
    return response.json()

def update_code_node(workflow, node_name, new_code):
    """Code 노드 업데이트"""
    for node in workflow['nodes']:
        if node['name'] == node_name and node['type'] == 'n8n-nodes-base.code':
            node['parameters']['jsCode'] = new_code
            print(f"✅ '{node_name}' 노드 업데이트 완료")
            return True
    print(f"❌ '{node_name}' 노드를 찾을 수 없습니다")
    return False

def main():
    print("🚀 AIASF n8n 워크플로우 업데이트 시작...")

    # 1. 워크플로우 가져오기
    print("\n1️⃣ 워크플로우 다운로드 중...")
    workflow = get_workflow()
    print(f"   워크플로우: {workflow['name']}")
    print(f"   노드 개수: {len(workflow['nodes'])}")

    # 2. Branding Router v5.1 적용
    print("\n2️⃣ Branding Router v5.1 적용 중...")
    with open('/home/user/OAACEO/scratch/n8n_branding_router_v5.1.js', 'r') as f:
        branding_code = f.read()
    update_code_node(workflow, 'Branding Router', branding_code)

    # 3. Shotstack Builder v20.39 적용
    print("\n3️⃣ Shotstack Builder v20.39 적용 중...")
    with open('/home/user/OAACEO/scratch/n8n_shotstack_builder_v20.39.js', 'r') as f:
        shotstack_code = f.read()
    update_code_node(workflow, 'Code', shotstack_code)

    # 4. 워크플로우 업데이트
    print("\n4️⃣ n8n에 업데이트 저장 중...")
    result = update_workflow(workflow)
    print(f"   ✅ 워크플로우 업데이트 완료!")
    print(f"   업데이트 시간: {result.get('updatedAt', 'N/A')}")

    print("\n" + "="*60)
    print("🎉 자동 업데이트 완료!")
    print("="*60)
    print("\n📋 다음 단계 (수동 작업 필요):")
    print("1. n8n UI 열기: http://38.60.220.9:5678/workflow/mhPPIHjYTH4sFUDK")
    print("2. '3. GPT 스크립트' 노드 클릭")
    print("3. System/User Prompt를 v6.18로 수동 업데이트")
    print("   (파일: /home/user/OAACEO/scratch/AIASF_GPT_Prompt_v6.18.md)")
    print("\n" + "="*60)

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n❌ 에러 발생: {e}")
        raise
